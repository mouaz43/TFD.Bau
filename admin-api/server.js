import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import fetch from "node-fetch";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const {
  PORT = 3000,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  SITE_ORIGIN,              // e.g. https://tfd-bau.onrender.com
  GITHUB_TOKEN,            // Classic PAT with repo scope
  GITHUB_OWNER = "mouaz43",
  GITHUB_REPO  = "TFD.Bau",
  GITHUB_BRANCH = "main",
  JSON_PATH = "content/project.json",
  UPLOAD_DIR = "assets/uploads",
  SESSION_SECRET = "tfd-secret-please-change"
} = process.env;

// --- helpers ---
const gh = async (path, opts = {}) => {
  const r = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `token ${GITHUB_TOKEN}`,
      ...(opts.headers || {})
    }
  });
  return r;
};
const contentUrl = (p) => `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(p)}`;
const utf8ToB64 = (str) => Buffer.from(str, "utf8").toString("base64");
const b64ToStr  = (b64) => Buffer.from(b64, "base64").toString("utf8");
const nowIso = () => new Date().toISOString().replace(/[:.]/g, "-");

// --- cors & parsing ---
app.use(cors({ origin: SITE_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser(SESSION_SECRET));

// --- auth middleware ---
const requireAuth = (req, res, next) => {
  const sid = req.signedCookies?.sid;
  if (!sid || sid !== "ok") return res.status(401).json({ ok: false, error: "unauthorized" });
  next();
};

// --- routes ---
app.get("/", (_, res) => res.json({ ok: true, service: "tfd-gallery-admin-api" }));

app.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.cookie("sid", "ok", { httpOnly: true, sameSite: "None", secure: true, signed: true, maxAge: 1000 * 60 * 60 * 12 });
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: "wrong-credentials" });
});

app.post("/logout", (req, res) => {
  res.clearCookie("sid", { httpOnly: true, sameSite: "None", secure: true, signed: true });
  res.json({ ok: true });
});

app.get("/projects", async (_req, res) => {
  try {
    const r = await gh(`${contentUrl(JSON_PATH)}?ref=${GITHUB_BRANCH}`);
    if (!r.ok) return res.status(500).json({ ok: false, error: "gh-get-json" });
    const j = await r.json();
    const arr = JSON.parse(b64ToStr(j.content));
    res.json({ ok: true, items: arr });
  } catch (e) { res.status(500).json({ ok: false, error: "parse-json" }); }
});

app.post("/projects", requireAuth, upload.fields([{ name: "before" }, { name: "after" }]), async (req, res) => {
  try {
    // 1) Load JSON + sha
    const r1 = await gh(`${contentUrl(JSON_PATH)}?ref=${GITHUB_BRANCH}`);
    if (!r1.ok) return res.status(500).json({ ok: false, error: "gh-get-json" });
    const j1 = await r1.json();
    const sha = j1.sha;
    const items = JSON.parse(b64ToStr(j1.content));

    const body = req.body || {};
    const id = String(body.id || "").trim();
    if (!id) return res.status(400).json({ ok: false, error: "missing-id" });
    if (items.find(x => x.id === id)) return res.status(400).json({ ok: false, error: "id-exists" });

    // 2) Upload images
    const upOne = async (file, suffix) => {
      const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase();
      const path = `${UPLOAD_DIR}/${id}-${suffix}-${nowIso()}.${ext}`;
      const put = await gh(contentUrl(path), {
        method: "PUT",
        body: JSON.stringify({
          message: `upload image: ${path}`,
          content: file.buffer.toString("base64"),
          branch: GITHUB_BRANCH
        })
      });
      if (!put.ok) {
        const t = await put.text();
        throw new Error(`upload-failed ${suffix}: ${t}`);
      }
      return `/${path}`;
    };
    const beforeFile = req.files?.before?.[0];
    const afterFile  = req.files?.after?.[0];
    if (!beforeFile || !afterFile) return res.status(400).json({ ok: false, error: "missing-images" });

    const beforeUrl = await upOne(beforeFile, "before");
    const afterUrl  = await upOne(afterFile,  "after");

    // 3) Build project obj
    const proj = {
      id,
      category: body.category,
      title: body.title,
      location: body.location,
      date: body.date,
      metrics: {
        qm: body.qm ? Number(body.qm) : undefined,
        dauer_tage: body.dauer_tage ? Number(body.dauer_tage) : undefined
      },
      before: beforeUrl,
      after: afterUrl,
      highlights: (body.highlights || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    };

    // 4) Save JSON
    const next = [...items, proj];
    const putJson = await gh(contentUrl(JSON_PATH), {
      method: "PUT",
      body: JSON.stringify({
        message: `gallery: add ${id}`,
        content: utf8ToB64(JSON.stringify(next, null, 2) + "\n"),
        branch: GITHUB_BRANCH,
        sha
      })
    });
    if (!putJson.ok) return res.status(500).json({ ok: false, error: "gh-put-json" });

    res.json({ ok: true, project: proj });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

app.delete("/projects/:id", requireAuth, async (req, res) => {
  try {
    // 1) Load JSON + sha
    const r1 = await gh(`${contentUrl(JSON_PATH)}?ref=${GITHUB_BRANCH}`);
    if (!r1.ok) return res.status(500).json({ ok: false, error: "gh-get-json" });
    const j1 = await r1.json();
    const sha = j1.sha;
    const items = JSON.parse(b64ToStr(j1.content));

    const id = req.params.id;
    const idx = items.findIndex(x => x.id === id);
    if (idx < 0) return res.status(404).json({ ok: false, error: "not-found" });
    const p = items[idx];

    // 2) Try delete images (if under UPLOAD_DIR)
    const delIf = async (urlPath) => {
      if (!urlPath) return;
      const path = urlPath.replace(/^\//, "");
      if (!path.startsWith(UPLOAD_DIR)) return;
      const meta = await gh(`${contentUrl(path)}?ref=${GITHUB_BRANCH}`);
      if (!meta.ok) return;
      const { sha } = await meta.json();
      await gh(contentUrl(path), {
        method: "DELETE",
        body: JSON.stringify({ message: `remove image ${path}`, sha, branch: GITHUB_BRANCH })
      });
    };
    await delIf(p.before);
    await delIf(p.after);

    // 3) Save JSON without project
    const next = items.filter(x => x.id !== id);
    const putJson = await gh(contentUrl(JSON_PATH), {
      method: "PUT",
      body: JSON.stringify({
        message: `gallery: delete ${id}`,
        content: utf8ToB64(JSON.stringify(next, null, 2) + "\n"),
        branch: GITHUB_BRANCH,
        sha
      })
    });
    if (!putJson.ok) return res.status(500).json({ ok: false, error: "gh-put-json" });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

app.listen(PORT, () => console.log("Admin API on :" + PORT));
