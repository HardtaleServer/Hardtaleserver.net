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
const STORE_RANK_PRODUCTS = {
  "rank-hero": { id: "rank-hero", name: "Hero Rank", price: 6.99, rank: "Hero", tier: 1 },
  "rank-legend": { id: "rank-legend", name: "Legend Rank", price: 14.0, rank: "Legend", tier: 2 },
  "rank-mythic": { id: "rank-mythic", name: "Mythic Rank", price: 24.0, rank: "Mythic", tier: 3 },
};
const STORE_PRODUCT_IDS = new Set(Object.keys(STORE_RANK_PRODUCTS));
const STORE_RANK_BY_LABEL = { Hero: 1, Legend: 2, Mythic: 3 };
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
let reactionsCollection = null;
let newsCollection = null;
let notificationsCollection = null;
let cartsCollection = null;
let purchasesCollection = null;
let mongoConnectInFlight = null;
let mongoReconnectTimer = null;
let mongoReconnectDelayMs = 1000;
const MAX_MONGO_RECONNECT_DELAY_MS = 30000;

function resetMongoState() {
  mongoClient = null;
  mongoDb = null;
  commentsCollection = null;
  commentRevisionsCollection = null;
  reactionsCollection = null;
  newsCollection = null;
  notificationsCollection = null;
  cartsCollection = null;
  purchasesCollection = null;
  mongoConnectInFlight = null;
}

function scheduleMongoReconnect() {
  if (mongoReconnectTimer) return;
  const delay = mongoReconnectDelayMs;
  mongoReconnectDelayMs = Math.min(mongoReconnectDelayMs * 2, MAX_MONGO_RECONNECT_DELAY_MS);
  mongoReconnectTimer = setTimeout(async () => {
    mongoReconnectTimer = null;
    try {
      await connectMongo();
    } catch {
      // connectMongo already logs the error and schedules the next retry.
    }
  }, delay);
}

async function connectMongo() {
  if (!MONGO_URI) {
    console.warn("MONGO_URI is not set. Comments will not persist.");
    return;
  }
  if (
    commentsCollection &&
    commentRevisionsCollection &&
    reactionsCollection &&
    newsCollection &&
    notificationsCollection &&
    cartsCollection &&
    purchasesCollection
  ) {
    return;
  }
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
      reactionsCollection = mongoDb.collection("reactions");
      newsCollection = mongoDb.collection("news");
      notificationsCollection = mongoDb.collection("notifications");
      cartsCollection = mongoDb.collection("carts");
      purchasesCollection = mongoDb.collection("purchases");
      await commentsCollection.createIndex({ newsId: 1, createdAt: 1 });
      await commentsCollection.createIndex({ userId: 1 });
      await commentRevisionsCollection.createIndex({ commentId: 1, createdAt: 1 });
      await reactionsCollection.createIndex({ itemType: 1, itemId: 1, emoji: 1, userId: 1 }, { unique: true });
      await reactionsCollection.createIndex({ itemType: 1, itemId: 1 });
      await reactionsCollection.createIndex({ itemType: 1, itemId: 1, userId: 1 });
      await newsCollection.createIndex({ id: 1 }, { unique: true });
      await newsCollection.createIndex({ isDeleted: 1, createdAt: -1 });
      await notificationsCollection.createIndex({ id: 1 }, { unique: true });
      await notificationsCollection.createIndex({ isDeleted: 1, createdAt: -1 });
      await cartsCollection.createIndex({ userId: 1 }, { unique: true });
      await purchasesCollection.createIndex({ userId: 1, createdAt: -1 });
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

function stripMongoId(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest;
}

function stripMongoIdList(list = []) {
  return list.map(stripMongoId).filter(Boolean);
}

async function pruneCollection(collection, maxItems) {
  const overflow = await collection
    .find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(maxItems)
    .project({ _id: 1 })
    .toArray();
  if (!overflow.length) return;
  await collection.deleteMany({ _id: { $in: overflow.map((entry) => entry._id) } });
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
  if (
    !commentsCollection ||
    !commentRevisionsCollection ||
    !reactionsCollection ||
    !newsCollection ||
    !notificationsCollection ||
    !cartsCollection ||
    !purchasesCollection
  ) {
    try {
      await connectMongo();
    } catch {
      // connectMongo already logs details and schedules a retry.
    }
  }
  if (
    !mongoClient ||
    !commentsCollection ||
    !commentRevisionsCollection ||
    !reactionsCollection ||
    !newsCollection ||
    !notificationsCollection ||
    !cartsCollection ||
    !purchasesCollection
  ) {
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

function getUserDisplayName(user) {
  return (
    normalizeText(user?.username, 80) ||
    normalizeText(getUserEmail(user), 80) ||
    normalizeText(user?.fullName, 80) ||
    "User"
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

function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  let highestRankEntry = null;
  let highestTier = 0;
  const normalized = [];
  for (const entry of items) {
    const id = normalizeText(entry?.id, 60);
    if (!id || seen.has(id) || !STORE_PRODUCT_IDS.has(id)) continue;
    seen.add(id);
    const product = STORE_RANK_PRODUCTS[id];
    if (product?.tier) {
      if (product.tier > highestTier) {
        highestTier = product.tier;
        highestRankEntry = { id };
      }
      continue;
    }
    normalized.push({ id });
  }
  if (highestRankEntry) normalized.push(highestRankEntry);
  return normalized;
}

function getHighestRankFromItems(items = []) {
  let best = null;
  let bestTier = 0;
  for (const entry of items) {
    const product = STORE_RANK_PRODUCTS[entry?.id];
    if (!product) continue;
    if (product.tier > bestTier) {
      best = product.rank;
      bestTier = product.tier;
    }
  }
  return best;
}

function maxRankLabel(currentRank, nextRank) {
  const currentTier = STORE_RANK_BY_LABEL[currentRank] || 0;
  const nextTier = STORE_RANK_BY_LABEL[nextRank] || 0;
  return nextTier > currentTier ? nextRank : currentRank;
}

function normalizeNewsItem(item) {
  const title = String(item?.title || "").trim().slice(0, 120);
  const description = String(item?.description || "").trim();
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
    if (!(await requireMongoReady(res))) return;
    const news = await newsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ news: stripMongoIdList(news) });
  } catch (error) {
    console.error("Failed to load news", error);
    return res.status(500).json({ error: "Failed to load news" });
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const notifications = await notificationsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ notifications: stripMongoIdList(notifications) });
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
    if (!(await requireMongoReady(res))) return;
    const itemType = normalizeText(req.query.type, 20);
    const itemId = normalizeText(req.query.id, 200);
    if (!["news", "changelog"].includes(itemType) || !itemId) {
      return res.status(400).json({ error: "Invalid reaction target" });
    }

    const auth = getAuth(req);
    const userId = auth?.userId || null;
    const docs = await reactionsCollection
      .find({ itemType, itemId })
      .project({ emoji: 1, userId: 1 })
      .toArray();

    const byEmoji = new Map();
    for (const doc of docs) {
      const key = doc.emoji;
      const current = byEmoji.get(key) || { emoji: key, count: 0, reactedByMe: false };
      current.count += 1;
      if (userId && doc.userId === userId) current.reactedByMe = true;
      byEmoji.set(key, current);
    }

    const reactions = Array.from(byEmoji.values())
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
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;

    const itemType = normalizeText(req.body?.type, 20);
    const itemId = normalizeText(req.body?.id, 200);
    const emoji = normalizeText(req.body?.emoji, 16);
    if (!["news", "changelog"].includes(itemType) || !itemId || !isValidEmoji(emoji)) {
      return res.status(400).json({ error: "Invalid reaction" });
    }

    const userId = auth.userId;
    const existing = await reactionsCollection.findOne({ itemType, itemId, emoji, userId });
    if (existing) {
      await reactionsCollection.deleteOne({ _id: existing._id });
    } else {
      const userReactionsCount = await reactionsCollection.countDocuments({
        itemType,
        itemId,
        userId,
      });
      if (userReactionsCount >= 2) {
        throw new Error("MAX_REACTIONS");
      }
      await reactionsCollection.insertOne({
        itemType,
        itemId,
        emoji,
        userId,
        createdAt: new Date(),
      });
    }

    const docs = await reactionsCollection
      .find({ itemType, itemId })
      .project({ emoji: 1, userId: 1 })
      .toArray();
    const byEmoji = new Map();
    for (const doc of docs) {
      const key = doc.emoji;
      const current = byEmoji.get(key) || { emoji: key, count: 0, reactedByMe: false };
      current.count += 1;
      if (doc.userId === userId) current.reactedByMe = true;
      byEmoji.set(key, current);
    }

    const reactions = Array.from(byEmoji.values())
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
    const authorUsername = normalizeText(user?.username, 80);
    await commentsCollection.insertOne({
      newsId,
      userId: auth.userId,
      body,
      editCount: 0,
      authorName: getUserDisplayName(user),
      authorUsername,
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
    const editorName = getUserDisplayName(user);
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
    const authorUsername = normalizeText(user?.username, 80);
    const reply = {
      id: crypto.randomUUID(),
      userId: auth.userId,
      body,
      createdAt: new Date(),
      updatedAt: new Date(),
      editCount: 0,
      authorName: getUserDisplayName(user),
      authorUsername,
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

app.patch("/api/comments/:id/replies/:replyId", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const nextBody = normalizeText(req.body?.text, 276);
    if (!nextBody) {
      return res.status(400).json({ error: "Invalid reply" });
    }
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid comment id" });
    }
    const replyId = normalizeText(req.params.replyId, 128);
    if (!replyId) {
      return res.status(400).json({ error: "Invalid reply id" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const editorName = getUserDisplayName(user);
    const editorImage = user?.imageUrl || "";

    const comment = await commentsCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    const replies = Array.isArray(comment.replies) ? comment.replies : [];
    const replyIndex = replies.findIndex((entry) => String(entry?.id || "") === replyId);
    if (replyIndex < 0) {
      return res.status(404).json({ error: "Reply not found" });
    }

    const reply = replies[replyIndex];
    if (reply?.userId !== auth.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await commentRevisionsCollection.insertOne({
      commentId: comment._id,
      replyId,
      editedBy: auth.userId,
      oldBody: reply.body || "",
      newBody: nextBody,
      createdAt: new Date(),
      editorName,
      editorImage,
      type: "reply",
    });

    const updatedReplies = [...replies];
    updatedReplies[replyIndex] = {
      ...reply,
      body: nextBody,
      updatedAt: new Date(),
      editCount: Number(reply?.editCount || 0) + 1,
    };
    await commentsCollection.updateOne(
      { _id: comment._id },
      { $set: { replies: updatedReplies, updatedAt: new Date() } },
    );

    const updated = await commentsCollection.findOne({ _id: comment._id });
    return res.json({ comment: normalizeComment(updated) });
  } catch (error) {
    console.error("Failed to update reply", error);
    return res.status(500).json({ error: "Failed to update reply" });
  }
});

app.delete("/api/comments/:id/replies/:replyId", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid comment id" });
    }
    const replyId = normalizeText(req.params.replyId, 128);
    if (!replyId) {
      return res.status(400).json({ error: "Invalid reply id" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const isAdmin = isAdminUser(user);

    const comment = await commentsCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const replies = Array.isArray(comment.replies) ? comment.replies : [];
    const replyIndex = replies.findIndex((entry) => String(entry?.id || "") === replyId);
    if (replyIndex < 0) {
      return res.json({ comment: normalizeComment(comment) });
    }
    const reply = replies[replyIndex];
    if (reply?.userId !== auth.userId && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updatedReplies = replies.filter((entry) => String(entry?.id || "") !== replyId);
    await commentsCollection.updateOne(
      { _id: comment._id },
      { $set: { replies: updatedReplies, updatedAt: new Date() } },
    );

    const updated = await commentsCollection.findOne({ _id: comment._id });
    return res.json({ comment: normalizeComment(updated) });
  } catch (error) {
    console.error("Failed to delete reply", error);
    return res.status(500).json({ error: "Failed to delete reply" });
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
      .find({
        commentId: new ObjectId(req.params.id),
        $or: [{ type: { $exists: false } }, { type: "comment" }],
      })
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
    if (!(await requireMongoReady(res))) return;
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

    await newsCollection.insertOne({
      ...item,
      isDeleted: false,
      updatedAt: new Date().toISOString(),
    });
    await pruneCollection(newsCollection, 20);

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

    const nextNews = await newsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ news: stripMongoIdList(nextNews) });
  } catch (error) {
    console.error("Failed to update news", error);
    return res.status(500).json({ error: "Failed to update news" });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const hardDelete = String(req.query.hard || req.body?.hard || "").toLowerCase();
    const shouldHardDelete = hardDelete === "1" || hardDelete === "true" || hardDelete === "yes";
    if (shouldHardDelete) {
      await newsCollection.deleteOne({ id: req.params.id });
    } else {
      await newsCollection.updateOne(
        { id: req.params.id },
        { $set: { isDeleted: true, updatedAt: new Date().toISOString() } },
      );
    }

    await updatePollsData((draft) => {
      if (draft.polls?.[req.params.id]) {
        delete draft.polls[req.params.id];
      }
      if (draft.votes?.[req.params.id]) {
        delete draft.votes[req.params.id];
      }
      return draft;
    });

    const nextNews = await newsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ news: stripMongoIdList(nextNews) });
  } catch (error) {
    console.error("Failed to delete news", error);
    return res.status(500).json({ error: "Failed to delete news" });
  }
});

app.patch("/api/news/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await newsCollection.updateOne(
      { id: req.params.id, isDeleted: false },
      { $set: { featured: Boolean(req.body?.featured), updatedAt: new Date().toISOString() } },
    );
    const nextNews = await newsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ news: stripMongoIdList(nextNews) });
  } catch (error) {
    console.error("Failed to update news", error);
    return res.status(500).json({ error: "Failed to update news" });
  }
});

app.post("/api/notifications", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
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

    await notificationsCollection.insertOne({
      ...item,
      isDeleted: false,
      updatedAt: new Date().toISOString(),
    });
    await pruneCollection(notificationsCollection, 60);

    const nextNotifications = await notificationsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ notifications: stripMongoIdList(nextNotifications) });
  } catch (error) {
    console.error("Failed to create notification", error);
    return res.status(500).json({ error: "Failed to create notification" });
  }
});

app.patch("/api/notifications/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await notificationsCollection.updateOne(
      { id: req.params.id, isDeleted: false },
      { $set: { featured: Boolean(req.body?.featured), updatedAt: new Date().toISOString() } },
    );
    const nextNotifications = await notificationsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ notifications: stripMongoIdList(nextNotifications) });
  } catch (error) {
    console.error("Failed to update notification", error);
    return res.status(500).json({ error: "Failed to update notification" });
  }
});

app.delete("/api/notifications/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const hardDelete = String(req.query.hard || req.body?.hard || "").toLowerCase();
    const shouldHardDelete = hardDelete === "1" || hardDelete === "true" || hardDelete === "yes";
    if (shouldHardDelete) {
      await notificationsCollection.deleteOne({ id: req.params.id });
    } else {
      await notificationsCollection.updateOne(
        { id: req.params.id },
        { $set: { isDeleted: true, updatedAt: new Date().toISOString() } },
      );
    }

    const nextNotifications = await notificationsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ notifications: stripMongoIdList(nextNotifications) });
  } catch (error) {
    console.error("Failed to delete notification", error);
    return res.status(500).json({ error: "Failed to delete notification" });
  }
});

app.get("/api/cart", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const cart = await cartsCollection.findOne({ userId: auth.userId });
    return res.json({ items: normalizeCartItems(cart?.items || []) });
  } catch (error) {
    console.error("Failed to load cart", error);
    return res.status(500).json({ error: "Failed to load cart" });
  }
});

app.post("/api/cart", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const items = normalizeCartItems(req.body?.items);
    await cartsCollection.updateOne(
      { userId: auth.userId },
      {
        $set: {
          userId: auth.userId,
          items,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );
    return res.json({ items });
  } catch (error) {
    console.error("Failed to save cart", error);
    return res.status(500).json({ error: "Failed to save cart" });
  }
});

app.post("/api/cart/checkout", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const cart = await cartsCollection.findOne({ userId: auth.userId });
    const items = normalizeCartItems(cart?.items || []);
    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const total = items.reduce((sum, entry) => sum + (STORE_RANK_PRODUCTS[entry.id]?.price || 0), 0);
    const purchasedHighestRank = getHighestRankFromItems(items);

    let awardedRank = "";
    if (purchasedHighestRank) {
      const user = await clerkClient.users.getUser(auth.userId);
      const currentRank = String(user?.publicMetadata?.rank || "Registered");
      awardedRank = maxRankLabel(currentRank, purchasedHighestRank);
      if (awardedRank !== currentRank) {
        await clerkClient.users.updateUserMetadata(auth.userId, {
          publicMetadata: {
            ...user.publicMetadata,
            rank: awardedRank,
          },
        });
        await commentsCollection.updateMany(
          { userId: auth.userId, isDeleted: false },
          { $set: { authorRank: awardedRank, updatedAt: new Date() } },
        );
      }
    }

    await purchasesCollection.insertOne({
      id: crypto.randomUUID(),
      userId: auth.userId,
      items,
      total,
      awardedRank: awardedRank || null,
      createdAt: new Date().toISOString(),
    });

    await cartsCollection.updateOne(
      { userId: auth.userId },
      {
        $set: {
          userId: auth.userId,
          items: [],
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    return res.json({
      success: true,
      cart: { items: [] },
      awardedRank: awardedRank || null,
    });
  } catch (error) {
    console.error("Failed to checkout cart", error);
    return res.status(500).json({ error: "Failed to checkout cart" });
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
