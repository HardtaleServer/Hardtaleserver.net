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
const DEFAULT_ADMIN_EMAILS = [
  "chashsmurfis@gmail.com",
  "hardtaleserver@gmail.com",
  "hytaleserver@gmail.com",
];
const configuredAdminEmails = (
  process.env.ADMIN_EMAILS ||
  process.env.ADMIN_EMAIL ||
  ""
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const ADMIN_EMAILS = [...new Set([...DEFAULT_ADMIN_EMAILS, ...configuredAdminEmails])];
const ADMIN_EMAIL_SET = new Set(ADMIN_EMAILS);
const ADMIN_NEWS_OWNER_EMAIL =
  (process.env.ADMIN_NEWS_OWNER_EMAIL || ADMIN_EMAILS[0] || "").toLowerCase();
const CLERK_PUBLISHABLE_KEY =
  process.env.CLERK_PUBLISHABLE_KEY ||
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "";

app.use(express.json({ limit: "100kb" }));
app.use("/api", clerkMiddleware());

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

function normalizeNotificationItem(item) {
  const title = String(item?.title || "").trim().slice(0, 120);
  const message = String(item?.message || "").trim().slice(0, 600);
  const author = String(item?.author || "").trim().slice(0, 80);
  const featured = Boolean(item?.featured);

  if (!title || !message || !author) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    title,
    message,
    author,
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

app.get("/api/notifications", async (req, res) => {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return res.json({ notifications: [] });
    }

    const notifications = Array.isArray(adminUser.publicMetadata?.notifications)
      ? adminUser.publicMetadata.notifications
      : [];

    return res.json({ notifications });
  } catch (error) {
    console.error("Failed to load notifications", error);
    return res.status(500).json({ error: "Failed to load notifications" });
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
        ...adminUser.publicMetadata,
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
        ...adminUser.publicMetadata,
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
        ...adminUser.publicMetadata,
        news: nextNews,
      },
    });

    return res.json({ news: nextNews });
  } catch (error) {
    console.error("Failed to update news", error);
    return res.status(500).json({ error: "Failed to update news" });
  }
});

app.post("/api/notifications", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const item = normalizeNotificationItem(req.body);
    if (!item) {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    const adminUser = await getAdminUser();
    if (!adminUser) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    const existing = Array.isArray(adminUser.publicMetadata?.notifications)
      ? adminUser.publicMetadata.notifications
      : [];
    const nextNotifications = [item, ...existing].slice(0, 60);

    await clerkClient.users.updateUserMetadata(adminUser.id, {
      publicMetadata: {
        ...adminUser.publicMetadata,
        notifications: nextNotifications,
      },
    });

    return res.json({ notifications: nextNotifications });
  } catch (error) {
    console.error("Failed to create notification", error);
    return res.status(500).json({ error: "Failed to create notification" });
  }
});

app.patch("/api/notifications/:id", async (req, res) => {
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

    const existing = Array.isArray(adminUser.publicMetadata?.notifications)
      ? adminUser.publicMetadata.notifications
      : [];

    const nextNotifications = existing.map((item) => {
      if (item.id !== req.params.id) return item;
      return {
        ...item,
        featured: Boolean(req.body?.featured),
      };
    });

    await clerkClient.users.updateUserMetadata(adminUser.id, {
      publicMetadata: {
        ...adminUser.publicMetadata,
        notifications: nextNotifications,
      },
    });

    return res.json({ notifications: nextNotifications });
  } catch (error) {
    console.error("Failed to update notification", error);
    return res.status(500).json({ error: "Failed to update notification" });
  }
});

app.delete("/api/notifications/:id", async (req, res) => {
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

    const existing = Array.isArray(adminUser.publicMetadata?.notifications)
      ? adminUser.publicMetadata.notifications
      : [];
    const nextNotifications = existing.filter((item) => item.id !== req.params.id);

    await clerkClient.users.updateUserMetadata(adminUser.id, {
      publicMetadata: {
        ...adminUser.publicMetadata,
        notifications: nextNotifications,
      },
    });

    return res.json({ notifications: nextNotifications });
  } catch (error) {
    console.error("Failed to delete notification", error);
    return res.status(500).json({ error: "Failed to delete notification" });
  }
});

app.get("/logo.png", (req, res) => {
  res.sendFile(logoPath);
});

app.get("/env.js", (req, res) => {
  res.type("application/javascript");
  res.send(
    `window.__CLERK_PUBLISHABLE_KEY__ = ${JSON.stringify(CLERK_PUBLISHABLE_KEY)};`,
  );
});

app.use("/Images", express.static(imagesDir));
app.use(express.static(publicDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
