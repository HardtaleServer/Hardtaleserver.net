import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  process.env.ADMIN_EMAIL ||
  "hardtaleserver@gmail.com"
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const ADMIN_EMAIL_SET = new Set(ADMIN_EMAILS);
const ADMIN_NEWS_OWNER_EMAIL =
  (process.env.ADMIN_NEWS_OWNER_EMAIL || ADMIN_EMAILS[0] || "").toLowerCase();

app.use(clerkMiddleware());
app.use(express.json({ limit: "100kb" }));

const publicDir = path.join(__dirname, "public");
const imagesDir = path.join(__dirname, "Images");
const logoPath = path.join(imagesDir, "IslandLogo", "Hero_Island_Logo.png");

function normalizeNewsItem(item) {
  const title = String(item?.title || "").trim().slice(0, 120);
  const description = String(item?.description || "").trim().slice(0, 600);
  const author = String(item?.author || "").trim().slice(0, 80);
  const readMoreUrl = String(item?.readMoreUrl || "").trim().slice(0, 500);
  const imageUrl = String(item?.imageUrl || "").trim().slice(0, 500);
  const featured = Boolean(item?.featured);

  if (!title || !description || !author) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    title,
    description,
    author,
    readMoreUrl,
    imageUrl,
    featured,
    createdAt: new Date().toISOString(),
  };
}

async function getAdminUser() {
  if (!ADMIN_NEWS_OWNER_EMAIL) return null;
  const { data } = await clerkClient.users.getUserList({
    emailAddress: [ADMIN_NEWS_OWNER_EMAIL],
  });
  return data?.[0] || null;
}

function isAdminUser(user) {
  if (!user || ADMIN_EMAIL_SET.size === 0) return false;
  return user.emailAddresses?.some(
    (entry) => ADMIN_EMAIL_SET.has(entry.emailAddress?.toLowerCase()),
  );
}

app.get("/api/me", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.json({ isAdmin: false });
    }
    const user = await clerkClient.users.getUser(auth.userId);
    return res.json({ isAdmin: isAdminUser(user) });
  } catch (error) {
    console.error("Failed to load user role", error);
    return res.status(500).json({ error: "Failed to load user role" });
  }
});

app.get("/api/news", async (req, res) => {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return res.json({ news: [] });
    }

    const news = Array.isArray(adminUser.publicMetadata?.news)
      ? adminUser.publicMetadata.news
      : [];

    return res.json({ news });
  } catch (error) {
    console.error("Failed to load news", error);
    return res.status(500).json({ error: "Failed to load news" });
  }
});

app.post("/api/news", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const item = normalizeNewsItem(req.body);
    if (!item) {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    const adminUser = await getAdminUser();
    if (!adminUser) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    const existing = Array.isArray(adminUser.publicMetadata?.news)
      ? adminUser.publicMetadata.news
      : [];

    const nextNews = [item, ...existing].slice(0, 20);

    await clerkClient.users.updateUserMetadata(adminUser.id, {
      publicMetadata: {
        news: nextNews,
      },
    });

    return res.json({ news: nextNews });
  } catch (error) {
    console.error("Failed to update news", error);
    return res.status(500).json({ error: "Failed to update news" });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const adminUser = await getAdminUser();
    if (!adminUser) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    const existing = Array.isArray(adminUser.publicMetadata?.news)
      ? adminUser.publicMetadata.news
      : [];

    const nextNews = existing.filter((item) => item.id !== req.params.id);

    await clerkClient.users.updateUserMetadata(adminUser.id, {
      publicMetadata: {
        news: nextNews,
      },
    });

    return res.json({ news: nextNews });
  } catch (error) {
    console.error("Failed to delete news", error);
    return res.status(500).json({ error: "Failed to delete news" });
  }
});

app.patch("/api/news/:id", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const adminUser = await getAdminUser();
    if (!adminUser) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    const existing = Array.isArray(adminUser.publicMetadata?.news)
      ? adminUser.publicMetadata.news
      : [];

    const nextNews = existing.map((item) => {
      if (item.id !== req.params.id) return item;
      return {
        ...item,
        featured: Boolean(req.body?.featured),
      };
    });

    await clerkClient.users.updateUserMetadata(adminUser.id, {
      publicMetadata: {
        news: nextNews,
      },
    });

    return res.json({ news: nextNews });
  } catch (error) {
    console.error("Failed to update news", error);
    return res.status(500).json({ error: "Failed to update news" });
  }
});

app.get("/logo.png", (req, res) => {
  res.sendFile(logoPath);
});

app.use("/Images", express.static(imagesDir));
app.use(express.static(publicDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
