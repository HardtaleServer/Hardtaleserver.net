import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs/promises";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

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
const COMMENTS_AUD = "hardtale-api-comments";
const COMMUNITY_DIR = "data";
const COMMUNITY_FILE = "community.json";
const POLLS_FILE = "polls.json";
const PERMISSIONS_FILE = "permissions.json";
const RANK_PRIORITY = ["Mythic", "Legend", "Hero", "Registered", "Unregistered"];
const MONGO_URI = process.env.MONGO_URI || "";
const MONGO_DB_NAME = process.env.MONGO_DB || "hardtaledb";

app.use(express.json({ limit: "100kb" }));
app.use("/api", clerkMiddleware());

const publicDir = path.join(__dirname, "public");
const imagesDir = path.join(__dirname, "Images");
const logoPath = path.join(imagesDir, "IslandLogo", "Hero_Island_Logo.png");
const communityDir = path.join(__dirname, COMMUNITY_DIR);
const communityPath = path.join(communityDir, COMMUNITY_FILE);
const pollsPath = path.join(communityDir, POLLS_FILE);
const permissionsPath = path.join(communityDir, PERMISSIONS_FILE);

const EMPTY_COMMUNITY_DATA = {
  reactions: { news: {}, changelog: {} },
  comments: {},
  commentRevisions: {},
};
const EMPTY_POLLS_DATA = {
  polls: {},
  votes: {},
};

let mongoClient = null;
let mongoDb = null;
let commentsCollection = null;
let commentRevisionsCollection = null;
let mongoConnectInFlight = null;
let mongoReconnectTimer = null;
let mongoReconnectDelayMs = 1000;
const MAX_MONGO_RECONNECT_DELAY_MS = 30000;

function resetMongoState() {
  mongoClient = null;
  mongoDb = null;
  commentsCollection = null;
  commentRevisionsCollection = null;
  mongoConnectInFlight = null;
}

function scheduleMongoReconnect() {
  if (mongoReconnectTimer) return;
  const delay = mongoReconnectDelayMs;
  mongoReconnectDelayMs = Math.min(mongoReconnectDelayMs * 2, MAX_MONGO_RECONNECT_DELAY_MS);
  mongoReconnectTimer = setTimeout(async () => {
    mongoReconnectTimer = null;
    await connectMongo();
  }, delay);
}

async function connectMongo() {
  if (!MONGO_URI) {
    console.warn("MONGO_URI is not set. Comments will not persist.");
    return;
  }
  if (commentsCollection && commentRevisionsCollection) return;
  if (mongoConnectInFlight) {
    await mongoConnectInFlight;
    return;
  }

  mongoConnectInFlight = (async () => {
    const client = new MongoClient(MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    try {
      await client.connect();
      mongoClient = client;
      mongoDb = mongoClient.db(MONGO_DB_NAME);
      commentsCollection = mongoDb.collection("comments");
      commentRevisionsCollection = mongoDb.collection("comment_revisions");
      await commentsCollection.createIndex({ newsId: 1, createdAt: 1 });
      await commentsCollection.createIndex({ userId: 1 });
      await commentRevisionsCollection.createIndex({ commentId: 1, createdAt: 1 });
      mongoReconnectDelayMs = 1000;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB", error);
      try {
        await client.close();
      } catch {
        // noop
      }
      resetMongoState();
      scheduleMongoReconnect();
      throw error;
    } finally {
      mongoConnectInFlight = null;
    }
  })();

  await mongoConnectInFlight;
}

connectMongo().catch(() => {
  // Initial connection errors are logged in connectMongo and retried in background.
});

function normalizeComment(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { ...rest, id: _id ? String(_id) : doc.id };
}

function normalizeCommentList(list = []) {
  return list.map(normalizeComment).filter(Boolean);
}

function requireMongo(res) {
  if (!MONGO_URI) {
    res.status(500).json({ error: "Database not configured" });
    return false;
  }
  return true;
}

async function requireMongoReady(res) {
  if (!requireMongo(res)) return false;
  if (!commentsCollection || !commentRevisionsCollection) {
    try {
      await connectMongo();
    } catch {
      // connectMongo already logs details and schedules a retry.
    }
  }
  if (!mongoClient || !commentsCollection || !commentRevisionsCollection) {
    res.status(503).json({
      error: "Database not connected",
      detail: "MongoDB connection is not ready. Check MONGO_URI and network access.",
    });
    return false;
  }
  return true;
}

let communityWriteQueue = Promise.resolve();

async function ensureCommunityStorage() {
  await fs.mkdir(communityDir, { recursive: true });
  try {
    await fs.access(communityPath);
  } catch {
    await fs.writeFile(communityPath, JSON.stringify(EMPTY_COMMUNITY_DATA, null, 2));
  }
}

async function ensurePollsStorage() {
  await fs.mkdir(communityDir, { recursive: true });
  try {
    await fs.access(pollsPath);
  } catch {
    await fs.writeFile(pollsPath, JSON.stringify(EMPTY_POLLS_DATA, null, 2));
  }
}

async function loadPermissionsData() {
  try {
    const raw = await fs.readFile(permissionsPath, "utf8");
    return JSON.parse(raw) || { users: {}, groups: {} };
  } catch {
    return { users: {}, groups: {} };
  }
}


async function loadCommunityData() {
  await ensureCommunityStorage();
  try {
    const raw = await fs.readFile(communityPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_COMMUNITY_DATA,
      ...parsed,
      reactions: {
        ...EMPTY_COMMUNITY_DATA.reactions,
        ...(parsed.reactions || {}),
      },
      comments: parsed.comments || {},
      commentRevisions: parsed.commentRevisions || {},
    };
  } catch {
    return { ...EMPTY_COMMUNITY_DATA };
  }
}

async function saveCommunityData(data) {
  await ensureCommunityStorage();
  await fs.writeFile(communityPath, JSON.stringify(data, null, 2));
}

async function loadPollsData() {
  await ensurePollsStorage();
  try {
    const raw = await fs.readFile(pollsPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_POLLS_DATA,
      ...parsed,
      polls: parsed.polls || {},
      votes: parsed.votes || {},
    };
  } catch {
    return { ...EMPTY_POLLS_DATA };
  }
}

async function savePollsData(data) {
  await ensurePollsStorage();
  await fs.writeFile(pollsPath, JSON.stringify(data, null, 2));
}

let pollsWriteQueue = Promise.resolve();
function updatePollsData(updater) {
  pollsWriteQueue = pollsWriteQueue
    .then(async () => {
      const data = await loadPollsData();
      const next = (await updater(data)) || data;
      await savePollsData(next);
      return next;
    })
    .catch((error) => {
      pollsWriteQueue = Promise.resolve();
      throw error;
    });
  return pollsWriteQueue;
}


function updateCommunityData(updater) {
  communityWriteQueue = communityWriteQueue
    .then(async () => {
      const data = await loadCommunityData();
      const next = (await updater(data)) || data;
      await saveCommunityData(next);
      return next;
    })
    .catch((error) => {
      communityWriteQueue = Promise.resolve();
      throw error;
    });
  return communityWriteQueue;
}

function requireCommentAuth(req, res) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  const aud = auth.sessionClaims?.aud;
  const matches =
    typeof aud === "string"
      ? aud === COMMENTS_AUD
      : Array.isArray(aud)
      ? aud.includes(COMMENTS_AUD)
      : false;
  if (!matches) {
    res.status(403).json({ error: "Invalid audience" });
    return null;
  }
  return auth;
}

function isValidEmoji(value) {
  if (!value) return false;
  if (typeof value !== "string") return false;
  if (value.length > 16) return false;
  return /\p{Extended_Pictographic}/u.test(value);
}

function normalizeText(value, limit) {
  return String(value || "").trim().slice(0, limit);
}

function getUserEmail(user) {
  return (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ""
  );
}

function normalizePoll(payload) {
  const question = normalizeText(payload?.question, 140);
  const multiple = Boolean(payload?.multiple);
  const options = Array.isArray(payload?.options) ? payload.options : [];
  const cleanOptions = options
    .map((option) => normalizeText(option, 80))
    .filter(Boolean)
    .slice(0, 4);
  if (!question || cleanOptions.length < 2) return null;
  return {
    question,
    multiple,
    options: cleanOptions.map((text) => ({ id: crypto.randomUUID(), text })),
  };
}

function extractRank(groups = []) {
  const set = new Set(groups);
  return RANK_PRIORITY.find((rank) => set.has(rank)) || "Unregistered";
}

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

app.get("/api/ranks", async (req, res) => {
  try {
    const data = await loadPermissionsData();
    const users = data.users || {};
    const ranks = {};
    Object.entries(users).forEach(([userId, entry]) => {
      const groups = Array.isArray(entry?.groups) ? entry.groups : [];
      ranks[userId] = extractRank(groups);
    });
    return res.json({ ranks });
  } catch (error) {
    console.error("Failed to load ranks", error);
    return res.status(500).json({ error: "Failed to load ranks" });
  }
});

app.post("/api/ranks/sync", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const data = await loadPermissionsData();
    const users = data.users || {};
    const updates = await Promise.allSettled(
      Object.entries(users).map(async ([userId, entry]) => {
        const groups = Array.isArray(entry?.groups) ? entry.groups : [];
        const rank = extractRank(groups);
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            rank,
          },
        });
        return { userId, rank };
      }),
    );

    const synced = updates.filter((u) => u.status === "fulfilled").length;
    const failed = updates.length - synced;
    return res.json({ synced, failed });
  } catch (error) {
    console.error("Failed to sync ranks", error);
    return res.status(500).json({ error: "Failed to sync ranks" });
  }
});

app.get("/api/polls", async (req, res) => {
  try {
    const newsId = normalizeText(req.query.newsId, 200);
    if (!newsId) {
      return res.status(400).json({ error: "Invalid poll target" });
    }
    const data = await loadPollsData();
    const poll = data.polls?.[newsId] || null;
    if (!poll) {
      return res.json({ poll: null });
    }
    const auth = getAuth(req);
    const userId = auth?.userId || null;
    const votesByUser = data.votes?.[newsId] || {};
    const userVotes = userId ? votesByUser[userId] || [] : [];
    const counts = poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      count: Object.values(votesByUser).filter((list) =>
        Array.isArray(list) && list.includes(option.id),
      ).length,
    }));
    const totalVotes = Object.keys(votesByUser).length;
    return res.json({
      poll: {
        ...poll,
        options: counts,
        totalVotes,
      },
      voted: userVotes,
    });
  } catch (error) {
    console.error("Failed to load poll", error);
    return res.status(500).json({ error: "Failed to load poll" });
  }
});

app.post("/api/polls/vote", async (req, res) => {
  try {
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const newsId = normalizeText(req.body?.newsId, 200);
    const optionIds = Array.isArray(req.body?.optionIds) ? req.body.optionIds : [];
    if (!newsId || optionIds.length === 0) {
      return res.status(400).json({ error: "Invalid vote" });
    }

    const data = await updatePollsData((draft) => {
      const poll = draft.polls?.[newsId];
      if (!poll) {
        throw new Error("NOT_FOUND");
      }
      const validOptionIds = new Set(poll.options.map((option) => option.id));
      const filtered = optionIds.filter((id) => validOptionIds.has(id));
      if (filtered.length === 0) {
        throw new Error("INVALID_OPTIONS");
      }
      if (!poll.multiple && filtered.length > 1) {
        throw new Error("TOO_MANY");
      }
      draft.votes[newsId] = draft.votes[newsId] || {};
      draft.votes[newsId][auth.userId] = filtered;
      return draft;
    });

    const poll = data.polls?.[newsId] || null;
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    const votesByUser = data.votes?.[newsId] || {};
    const userVotes = votesByUser[auth.userId] || [];
    const counts = poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      count: Object.values(votesByUser).filter((list) =>
        Array.isArray(list) && list.includes(option.id),
      ).length,
    }));
    const totalVotes = Object.keys(votesByUser).length;
    return res.json({
      poll: { ...poll, options: counts, totalVotes },
      voted: userVotes,
    });
  } catch (error) {
    if (error?.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Poll not found" });
    }
    if (error?.message === "TOO_MANY") {
      return res.status(400).json({ error: "Only one choice allowed" });
    }
    if (error?.message === "INVALID_OPTIONS") {
      return res.status(400).json({ error: "Invalid choices" });
    }
    console.error("Failed to vote", error);
    return res.status(500).json({ error: "Failed to vote" });
  }
});

app.get("/api/reactions", async (req, res) => {
  try {
    const itemType = normalizeText(req.query.type, 20);
    const itemId = normalizeText(req.query.id, 200);
    if (!["news", "changelog"].includes(itemType) || !itemId) {
      return res.status(400).json({ error: "Invalid reaction target" });
    }

    const auth = getAuth(req);
    const userId = auth?.userId || null;
    const data = await loadCommunityData();
    const itemReactions = data.reactions?.[itemType]?.[itemId] || {};

    const reactions = Object.entries(itemReactions)
      .map(([emoji, users]) => ({
        emoji,
        count: Array.isArray(users) ? users.length : 0,
        reactedByMe: userId ? Array.isArray(users) && users.includes(userId) : false,
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);

    return res.json({ itemType, itemId, reactions });
  } catch (error) {
    console.error("Failed to load reactions", error);
    return res.status(500).json({ error: "Failed to load reactions" });
  }
});

app.post("/api/reactions", async (req, res) => {
  try {
    const auth = requireCommentAuth(req, res);
    if (!auth) return;

    const itemType = normalizeText(req.body?.type, 20);
    const itemId = normalizeText(req.body?.id, 200);
    const emoji = normalizeText(req.body?.emoji, 16);
    if (!["news", "changelog"].includes(itemType) || !itemId || !isValidEmoji(emoji)) {
      return res.status(400).json({ error: "Invalid reaction" });
    }

    const userId = auth.userId;

    const data = await updateCommunityData((draft) => {
      const reactionsRoot = draft.reactions[itemType] || {};
      const itemReactions = reactionsRoot[itemId] || {};
      const users = Array.isArray(itemReactions[emoji]) ? itemReactions[emoji] : [];
      const hasReacted = users.includes(userId);

      if (!hasReacted) {
        const userReactionsCount = Object.values(itemReactions).filter((list) =>
          Array.isArray(list) && list.includes(userId),
        ).length;
        if (userReactionsCount >= 2) {
          throw new Error("MAX_REACTIONS");
        }
        itemReactions[emoji] = [...users, userId];
      } else {
        const nextUsers = users.filter((id) => id !== userId);
        if (nextUsers.length === 0) {
          delete itemReactions[emoji];
        } else {
          itemReactions[emoji] = nextUsers;
        }
      }

      reactionsRoot[itemId] = itemReactions;
      draft.reactions[itemType] = reactionsRoot;
      return draft;
    });

    const itemReactions = data.reactions?.[itemType]?.[itemId] || {};
    const reactions = Object.entries(itemReactions)
      .map(([entryEmoji, users]) => ({
        emoji: entryEmoji,
        count: Array.isArray(users) ? users.length : 0,
        reactedByMe: Array.isArray(users) && users.includes(userId),
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);

    return res.json({ itemType, itemId, reactions });
  } catch (error) {
    if (error?.message === "MAX_REACTIONS") {
      return res.status(400).json({ error: "Maximum reactions reached" });
    }
    console.error("Failed to update reactions", error);
    return res.status(500).json({ error: "Failed to update reactions" });
  }
});

app.get("/api/comments", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const newsId = normalizeText(req.query.newsId, 200);
    if (!newsId) {
      return res.status(400).json({ error: "Invalid news id" });
    }
    const comments = await commentsCollection
      .find({ newsId, isDeleted: false })
      .sort({ createdAt: 1 })
      .toArray();
    return res.json({
      newsId,
      comments: normalizeCommentList(comments),
    });
  } catch (error) {
    console.error("Failed to load comments", error);
    return res.status(500).json({ error: "Failed to load comments" });
  }
});

app.post("/api/comments", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const newsId = normalizeText(req.body?.newsId, 200);
    const body = normalizeText(req.body?.text, 276);
    if (!newsId || !body) {
      return res.status(400).json({ error: "Invalid comment" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const email = getUserEmail(user);
    const rank = String(user?.publicMetadata?.rank || "Registered");
    await commentsCollection.insertOne({
      newsId,
      userId: auth.userId,
      body,
      editCount: 0,
      authorName: user?.fullName || user?.username || "User",
      authorImage: user?.imageUrl || "",
      authorEmail: email,
      authorRank: rank,
      replies: [],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const comments = await commentsCollection
      .find({ newsId, isDeleted: false })
      .sort({ createdAt: 1 })
      .toArray();

    return res.json({
      newsId,
      comments: normalizeCommentList(comments),
    });
  } catch (error) {
    console.error("Failed to add comment", error);
    return res.status(500).json({ error: "Failed to add comment" });
  }
});

app.patch("/api/comments/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const nextBody = normalizeText(req.body?.text, 276);
    if (!nextBody) {
      return res.status(400).json({ error: "Invalid comment" });
    }
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid comment id" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const editorName = user?.fullName || user?.username || "User";
    const editorImage = user?.imageUrl || "";

    const comment = await commentsCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.userId !== auth.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await commentRevisionsCollection.insertOne({
      commentId: comment._id,
      editedBy: auth.userId,
      oldBody: comment.body,
      newBody: nextBody,
      createdAt: new Date(),
      editorName,
      editorImage,
    });

    await commentsCollection.updateOne(
      { _id: comment._id },
      {
        $set: { body: nextBody, updatedAt: new Date() },
        $inc: { editCount: 1 },
      },
    );

    const updated = await commentsCollection.findOne({ _id: comment._id });
    return res.json({ comment: normalizeComment(updated) });
  } catch (error) {
    console.error("Failed to update comment", error);
    return res.status(500).json({ error: "Failed to update comment" });
  }
});

app.post("/api/comments/:id/replies", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const body = normalizeText(req.body?.text, 276);
    if (!body) {
      return res.status(400).json({ error: "Invalid reply" });
    }
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid comment id" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const email = getUserEmail(user);
    const rank = String(user?.publicMetadata?.rank || "Registered");
    const reply = {
      id: crypto.randomUUID(),
      userId: auth.userId,
      body,
      createdAt: new Date(),
      authorName: user?.fullName || user?.username || "User",
      authorImage: user?.imageUrl || "",
      authorEmail: email,
      authorRank: rank,
    };

    const comment = await commentsCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    const updatedReplies = [...(comment.replies || []), reply].slice(-50);
    await commentsCollection.updateOne(
      { _id: comment._id },
      { $set: { replies: updatedReplies, updatedAt: new Date() } },
    );

    const updated = await commentsCollection.findOne({ _id: comment._id });
    return res.json({ comment: normalizeComment(updated) });
  } catch (error) {
    console.error("Failed to add reply", error);
    return res.status(500).json({ error: "Failed to add reply" });
  }
});

app.delete("/api/comments/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid comment id" });
    }
    const user = await clerkClient.users.getUser(auth.userId);
    const isAdmin = isAdminUser(user);

    const comment = await commentsCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });
    if (!comment) {
      return res.json({ success: true });
    }
    if (comment.userId !== auth.userId && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await commentsCollection.updateOne(
      { _id: comment._id },
      { $set: { isDeleted: true, updatedAt: new Date() } },
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete comment", error);
    return res.status(500).json({ error: "Failed to delete comment" });
  }
});

app.get("/api/comments/:id/history", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid comment id" });
    }
    const history = await commentRevisionsCollection
      .find({ commentId: new ObjectId(req.params.id) })
      .sort({ createdAt: 1 })
      .toArray();
    return res.json({ commentId: req.params.id, history });
  } catch (error) {
    console.error("Failed to load comment history", error);
    return res.status(500).json({ error: "Failed to load comment history" });
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

    const pollPayload = normalizePoll(req.body?.poll);
    if (pollPayload) {
      await updatePollsData((draft) => {
        draft.polls[item.id] = {
          id: crypto.randomUUID(),
          newsId: item.id,
          question: pollPayload.question,
          multiple: pollPayload.multiple,
          options: pollPayload.options,
          createdAt: new Date().toISOString(),
          createdBy: auth.userId,
        };
        return draft;
      });
    }

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

    await updatePollsData((draft) => {
      if (draft.polls?.[req.params.id]) {
        delete draft.polls[req.params.id];
      }
      if (draft.votes?.[req.params.id]) {
        delete draft.votes[req.params.id];
      }
      return draft;
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
