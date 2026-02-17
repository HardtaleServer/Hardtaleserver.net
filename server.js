import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs/promises";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STARTUP_FLAGS = new Set(
  process.argv
    .slice(2)
    .map((arg) => String(arg || "").trim().toLowerCase())
    .filter(Boolean),
);
const LOCAL_DEV_MODE =
  STARTUP_FLAGS.has("dev") ||
  STARTUP_FLAGS.has("--dev") ||
  STARTUP_FLAGS.has("--local") ||
  String(process.env.LOCAL_DEV_MODE || "false").toLowerCase() === "true";
const LOCAL_DEV_LINK_SERVICE_BASE_URL = "http://127.0.0.1:8080";

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = String(process.env.HOST || "0.0.0.0").trim() || "0.0.0.0";
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
const DEFAULT_ADMIN_USERNAMES = ["support", "smurfis", "hardtale"];
const configuredAdminUsernames = (
  process.env.ADMIN_USERNAMES ||
  process.env.ADMIN_USERNAME ||
  ""
)
  .split(",")
  .map((name) => name.trim().toLowerCase())
  .filter(Boolean);
const ADMIN_USERNAME_SET = new Set([
  ...DEFAULT_ADMIN_USERNAMES.map((name) => name.toLowerCase()),
  ...configuredAdminUsernames,
]);
const configuredAdminUserIds = (
  process.env.ADMIN_USER_IDS ||
  process.env.ADMIN_USER_ID ||
  ""
)
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const ADMIN_USER_ID_SET = new Set(configuredAdminUserIds);
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
const STAFF_ROLE_ORDER = ["Operator", "Developer", "Admin", "Moderator", "Helper", "Staff"];
const STAFF_ROLE_SET = new Set(STAFF_ROLE_ORDER);
const TOP_STAFF_ROLE_SET = new Set(["Operator", "Developer", "Admin"]);
const DEFAULT_STAFF_ROLE_BY_USERNAME = new Map([
  ["smurfis", "Operator"],
  ["hardtale", "Admin"],
]);
const NOTIFICATION_PROFILE_ALIAS_SOURCE_USERNAME = String(
  process.env.NOTIFICATION_PROFILE_ALIAS_SOURCE_USERNAME || "smurfis",
)
  .trim()
  .slice(0, 80);
const NOTIFICATION_PROFILE_ALIAS_TARGETS = new Set(["system", "admin", "hardtale"]);
let notificationAliasSourceCache = {
  userId: "",
  expiresAt: 0,
};
const STORE_RANK_PRODUCTS = {
  "rank-hero": { id: "rank-hero", name: "Hero Rank", price: 6.99, rank: "Hero", tier: 1 },
  "rank-legend": { id: "rank-legend", name: "Legend Rank", price: 14.0, rank: "Legend", tier: 2 },
  "rank-mythic": { id: "rank-mythic", name: "Mythic Rank", price: 24.0, rank: "Mythic", tier: 3 },
};
const STORE_RANK_PRODUCT_BY_TIER = Object.values(STORE_RANK_PRODUCTS).reduce((map, product) => {
  if (product?.tier) map[product.tier] = product;
  return map;
}, {});
const STORE_PRODUCT_IDS = new Set(Object.keys(STORE_RANK_PRODUCTS));
const STORE_RANK_BY_LABEL = { Hero: 1, Legend: 2, Mythic: 3 };
const DONOR_RANK_SET = new Set(["Hero", "Legend", "Mythic"]);
const DISPLAY_TITLES = ["Registered", "Hero", "Legend", "Mythic"];
const STAFF_DISPLAY_TITLE = "Staff";
const DISPLAY_TITLE_TIER = { Registered: 0, Hero: 1, Legend: 2, Mythic: 3 };
const OWNED_RANKS = ["Unregistered", "Registered", "Hero", "Legend", "Mythic"];
const DONOR_BADGE_ORDER = ["Hero", "Legend", "Mythic"];
const ACHIEVEMENT_DEFS = [
  {
    key: "welcome_login",
    title: "Welcome!",
    description: "Login to Hardtale",
    icon: "W",
  },
  {
    key: "unlinked_state",
    title: "Unlinked",
    description: "Account is currently unlinked",
    icon: "🔓",
  },
  {
    key: "linked_state",
    title: "Linked",
    description: "Account is currently linked",
    icon: "🔗",
  },
  {
    key: "linking_up",
    title: "Linking up",
    description: "Use /link successfully",
    icon: "L",
  },
];
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "";
const MONGO_DB_NAME = process.env.MONGO_DB || process.env.MONGODB_DB || "hardtaledb";
const SERVER_SECRET = String(process.env.SERVER_SECRET || process.env.HARDTALE_API_TOKEN || process.env.FULFILLMENT_API_TOKEN || "").trim();
const FULFILLMENT_API_TOKEN = String(process.env.FULFILLMENT_API_TOKEN || "").trim();
const HARDTALE_API_TOKEN = String(process.env.HARDTALE_API_TOKEN || "").trim();
const PLUGIN_API_TOKENS = Array.from(
  new Set(
    [HARDTALE_API_TOKEN, FULFILLMENT_API_TOKEN, String(process.env.LINK_SERVICE_AUTH_TOKEN || "").trim()].filter(Boolean),
  ),
);
const LINK_SERVICE_BASE_URL = LOCAL_DEV_MODE
  ? LOCAL_DEV_LINK_SERVICE_BASE_URL
  : String(process.env.LINK_SERVICE_BASE_URL || "").trim();
const LINK_SERVICE_AUTH_TOKEN = String(process.env.LINK_SERVICE_AUTH_TOKEN || "").trim();
const LINKING_ENABLED = String(
  process.env.LINKING_ENABLED || process.env.LINK_REDEEM_ENABLED || "false",
).toLowerCase() === "true";
const HYTALE_JWT_ISSUER = String(process.env.HYTALE_JWT_ISSUER || "").trim();
const HYTALE_JWT_AUDIENCE = String(process.env.HYTALE_JWT_AUDIENCE || "").trim();
const HYTALE_JWT_JWKS_URL = String(process.env.HYTALE_JWT_JWKS_URL || "").trim();
const HYTALE_JWT_SHARED_SECRET = String(process.env.HYTALE_JWT_SHARED_SECRET || "").trim();
const HYTALE_JWT_CLOCK_SKEW_SEC = Math.max(
  0,
  Math.min(Number(process.env.HYTALE_JWT_CLOCK_SKEW_SEC || 30), 300),
);
const HYTALE_JWT_ENABLED = Boolean(HYTALE_JWT_SHARED_SECRET || HYTALE_JWT_JWKS_URL);
const LINK_SERVICE_REDEEM_PATHS = String(
  process.env.LINK_SERVICE_REDEEM_PATHS || "/api/v1/link/redeem",
)
  .split(",")
  .map((entry) => String(entry || "").trim())
  .filter(Boolean)
  .map((entry) => (entry.startsWith("/") ? entry : `/${entry}`));
const LINK_SERVICE_LOCALHOST_PATTERN = /^https?:\/\/(localhost|127(?:\.\d{1,3}){3})(:\d+)?(?:\/|$)/i;
const LINK_SERVICE_TIMEOUT_MS = Math.max(
  2000,
  Math.min(Number(process.env.LINK_SERVICE_TIMEOUT_MS || 8000), 20000),
);
const LINK_REDEEM_DOWNSTREAM_FALLBACK_ENABLED = String(
  process.env.LINK_REDEEM_DOWNSTREAM_FALLBACK_ENABLED || "false",
).toLowerCase() === "true";
const LINK_CODE_TTL_SEC = Math.max(60, Math.min(Number(process.env.LINK_CODE_TTL_SEC || 300), 3600));
const LINK_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SERVER_HEARTBEAT_INTERVAL_MS = 15 * 60 * 1000;
const SERVER_HEARTBEAT_STALE_AFTER_MS = SERVER_HEARTBEAT_INTERVAL_MS * 2;
const DEFAULT_SERVER_ID = "prod";
const SMURFIS_TEST_LINK_UUID = "826ac345-e6fe-4ec7-a5fd-0b170b9d6439";
const SMURFIS_TEST_LINK_USERNAMES = new Set(["smurfis"]);
const SMURFIS_TEST_LINK_EMAILS = new Set([
  "chashsmurfis@gmail.com",
  "hardtaleserver@gmail.com",
  "hytaleserver@gmail.com",
]);
const STRIPE_SECRET_KEY = String(process.env.STRIPE_SECRET_KEY || "").trim();
const STRIPE_PUBLISHABLE_KEY = String(
  process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
).trim();
const STRIPE_WEBHOOK_SECRET = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
const STRIPE_CURRENCY = String(process.env.STRIPE_CURRENCY || "usd")
  .trim()
  .toLowerCase();
const STRIPE_CHECKOUT_BASE_URL = String(process.env.STRIPE_CHECKOUT_BASE_URL || "").trim();
const STRIPE_ENABLED = Boolean(STRIPE_SECRET_KEY);
const stripeClient = STRIPE_ENABLED
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })
  : null;

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
let forumPostRevisionsCollection = null;
let reactionsCollection = null;
let newsCollection = null;
let notificationsCollection = null;
let notificationReadsCollection = null;
let cartsCollection = null;
let purchasesCollection = null;
let supportTicketsCollection = null;
let forumPostsCollection = null;
let linkedAccountsCollection = null;
let userAchievementsCollection = null;
let linkCodesCollection = null;
let fulfillmentJobsCollection = null;
let grantsCollection = null;
let mongoConnectInFlight = null;
let mongoReconnectTimer = null;
let mongoReconnectDelayMs = 1000;
const MAX_MONGO_RECONNECT_DELAY_MS = 30000;
let hytaleJwksCache = {
  expiresAt: 0,
  keys: [],
};
const serverHeartbeatById = new Map();

function resetMongoState() {
  mongoClient = null;
  mongoDb = null;
  commentsCollection = null;
  commentRevisionsCollection = null;
  forumPostRevisionsCollection = null;
  reactionsCollection = null;
  newsCollection = null;
  notificationsCollection = null;
  notificationReadsCollection = null;
  cartsCollection = null;
  purchasesCollection = null;
  supportTicketsCollection = null;
  forumPostsCollection = null;
  linkedAccountsCollection = null;
  userAchievementsCollection = null;
  linkCodesCollection = null;
  fulfillmentJobsCollection = null;
  grantsCollection = null;
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
    forumPostRevisionsCollection &&
    reactionsCollection &&
    newsCollection &&
    notificationsCollection &&
    notificationReadsCollection &&
    cartsCollection &&
    purchasesCollection &&
    supportTicketsCollection &&
    forumPostsCollection &&
    linkedAccountsCollection &&
    userAchievementsCollection &&
    linkCodesCollection &&
    fulfillmentJobsCollection &&
    grantsCollection
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
      forumPostRevisionsCollection = mongoDb.collection("forum_post_revisions");
      reactionsCollection = mongoDb.collection("reactions");
      newsCollection = mongoDb.collection("news");
      notificationsCollection = mongoDb.collection("notifications");
      notificationReadsCollection = mongoDb.collection("notification_reads");
      cartsCollection = mongoDb.collection("carts");
      purchasesCollection = mongoDb.collection("purchases");
      supportTicketsCollection = mongoDb.collection("support_tickets");
      forumPostsCollection = mongoDb.collection("forum_posts");
      linkedAccountsCollection = mongoDb.collection("linked_accounts");
      userAchievementsCollection = mongoDb.collection("user_achievements");
      linkCodesCollection = mongoDb.collection("link_codes");
      fulfillmentJobsCollection = mongoDb.collection("fulfillment_jobs");
      grantsCollection = mongoDb.collection("grants");
      await commentsCollection.createIndex({ newsId: 1, createdAt: 1 });
      await commentsCollection.createIndex({ userId: 1 });
      await commentRevisionsCollection.createIndex({ commentId: 1, createdAt: 1 });
      await forumPostRevisionsCollection.createIndex({ postId: 1, createdAt: 1 });
      await reactionsCollection.createIndex({ itemType: 1, itemId: 1, emoji: 1, userId: 1 }, { unique: true });
      await reactionsCollection.createIndex({ itemType: 1, itemId: 1 });
      await reactionsCollection.createIndex({ itemType: 1, itemId: 1, userId: 1 });
      await newsCollection.createIndex({ id: 1 }, { unique: true });
      await newsCollection.createIndex({ isDeleted: 1, createdAt: -1 });
      await notificationsCollection.createIndex({ id: 1 }, { unique: true });
      await notificationsCollection.createIndex({ isDeleted: 1, createdAt: -1 });
      await notificationReadsCollection.createIndex({ userId: 1, notificationId: 1 }, { unique: true });
      await notificationReadsCollection.createIndex({ userId: 1, readAt: -1 });
      await cartsCollection.createIndex({ userId: 1 }, { unique: true });
      await purchasesCollection.createIndex({ userId: 1, createdAt: -1 });
      await purchasesCollection.createIndex({ purchaseId: 1 }, { unique: true, sparse: true });
      await purchasesCollection.createIndex({ fulfilled: 1, status: 1, createdAt: 1 });
      await purchasesCollection.createIndex({ status: 1, fulfillmentState: 1, fulfilled: 1, createdAt: 1 });
      await purchasesCollection.createIndex({ uuid: 1, fulfilled: 1, status: 1, createdAt: 1 });
      await supportTicketsCollection.createIndex({ id: 1 }, { unique: true });
      await supportTicketsCollection.createIndex({ createdBy: 1, createdAt: -1 });
      await supportTicketsCollection.createIndex({ status: 1, updatedAt: -1 });
      await forumPostsCollection.createIndex({ id: 1 }, { unique: true });
      await forumPostsCollection.createIndex({ section: 1, createdAt: -1 });
      await forumPostsCollection.createIndex({ createdBy: 1, createdAt: -1 });
      await linkedAccountsCollection.createIndex({ webUserId: 1 }, { unique: true });
      await linkedAccountsCollection.createIndex({ playerUuid: 1 }, { unique: true });
      await linkedAccountsCollection.createIndex({ updatedAt: -1 });
      await userAchievementsCollection.createIndex({ userId: 1, key: 1 }, { unique: true });
      await userAchievementsCollection.createIndex({ userId: 1, unlockedAt: -1 });
      await linkCodesCollection.createIndex({ code: 1 }, { unique: true });
      await linkCodesCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await linkCodesCollection.createIndex({ playerUuid: 1, createdAt: -1 });
      await linkCodesCollection.createIndex({ status: 1, claimedAt: 1, expiresAt: 1 });
      await fulfillmentJobsCollection.createIndex({ jobId: 1 }, { unique: true });
      await fulfillmentJobsCollection.createIndex({ status: 1, createdAt: 1 });
      await fulfillmentJobsCollection.createIndex({ playerUuid: 1, status: 1, createdAt: 1 });
      await grantsCollection.createIndex({ status: 1, createdAt: 1 });
      await grantsCollection.createIndex({ playerUuid: 1, status: 1, createdAt: 1 });
      await grantsCollection.createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true });
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
  const normalized = {
    ...rest,
    id: _id ? String(_id) : doc.id,
    authorUsername: formatUsernameForDisplay(rest.authorUsername, 80),
    authorOwnedRank: normalizeOwnedRank(rest.authorOwnedRank) || "Unregistered",
    authorIsStaff: Boolean(rest.authorIsStaff),
    authorStaffRole: normalizeStaffRole(rest.authorStaffRole),
    authorShowStaffBadge: rest.authorShowStaffBadge !== false,
    authorShowStaffBadgeIcon: rest.authorShowStaffBadgeIcon !== false,
    authorShowStaffGradient: rest.authorShowStaffGradient !== false,
    authorShowRankEffects: rest.authorShowRankEffects !== false,
    authorShowAvatarVfx: rest.authorShowAvatarVfx !== false,
    authorUseRankFont: rest.authorUseRankFont === true,
    authorShowDonorGradient: rest.authorShowDonorGradient !== false,
  };
  if (
    normalized.authorName &&
    normalized.authorUsername &&
    String(normalized.authorName).toLowerCase() === String(rest.authorUsername || "").toLowerCase()
  ) {
    normalized.authorName = normalized.authorUsername;
  }
  if (Array.isArray(normalized.replies)) {
    normalized.replies = normalized.replies.map((reply) => {
      if (!reply) return reply;
      const replyUsername = formatUsernameForDisplay(reply.authorUsername, 80);
      const nextReply = {
        ...reply,
        authorUsername: replyUsername,
        authorOwnedRank: normalizeOwnedRank(reply.authorOwnedRank) || "Unregistered",
        authorIsStaff: Boolean(reply.authorIsStaff),
        authorStaffRole: normalizeStaffRole(reply.authorStaffRole),
        authorShowStaffBadge: reply.authorShowStaffBadge !== false,
        authorShowStaffBadgeIcon: reply.authorShowStaffBadgeIcon !== false,
        authorShowStaffGradient: reply.authorShowStaffGradient !== false,
        authorShowRankEffects: reply.authorShowRankEffects !== false,
        authorShowAvatarVfx: reply.authorShowAvatarVfx !== false,
        authorUseRankFont: reply.authorUseRankFont === true,
        authorShowDonorGradient: reply.authorShowDonorGradient !== false,
      };
      if (
        nextReply.authorName &&
        replyUsername &&
        String(nextReply.authorName).toLowerCase() === String(reply.authorUsername || "").toLowerCase()
      ) {
        nextReply.authorName = replyUsername;
      }
      return nextReply;
    });
  }
  return normalized;
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
    !notificationReadsCollection ||
    !cartsCollection ||
    !purchasesCollection ||
    !supportTicketsCollection ||
    !forumPostsCollection ||
    !forumPostRevisionsCollection ||
    !linkedAccountsCollection ||
    !userAchievementsCollection ||
    !linkCodesCollection ||
    !fulfillmentJobsCollection ||
    !grantsCollection
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
    !notificationReadsCollection ||
    !cartsCollection ||
    !purchasesCollection ||
    !supportTicketsCollection ||
    !forumPostsCollection ||
    !forumPostRevisionsCollection ||
    !linkedAccountsCollection ||
    !userAchievementsCollection ||
    !linkCodesCollection ||
    !fulfillmentJobsCollection ||
    !grantsCollection
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

function secretFingerprint(value) {
  const token = String(value || "");
  if (!token) return "len=0";
  if (token.length <= 8) return `len=${token.length} value=${"*".repeat(token.length)}`;
  return `len=${token.length} value=${token.slice(0, 4)}...${token.slice(-4)}`;
}

function requireFulfillmentAuth(req, res, routeLabel = "server_api") {
  if (PLUGIN_API_TOKENS.length === 0) {
    console.warn(`[server.auth] ${routeLabel} denied: no server API token configured`);
    res.status(503).json({ error: "Plugin API token is not configured" });
    return false;
  }
  const authHeader = String(req.headers?.authorization || "");
  const prefix = "Bearer ";
  const bearerToken = authHeader.startsWith(prefix) ? authHeader.slice(prefix.length).trim() : "";
  const headerServerSecret = normalizeText(req.headers?.["x-server-secret"], 4096);
  const serviceToken = normalizeText(req.headers?.["x-service-auth"], 4096);
  const token = bearerToken || headerServerSecret || serviceToken;
  if (!token) {
    console.warn(
      `[server.auth] ${routeLabel} denied: missing auth header (accepted: Authorization Bearer / X-Server-Secret / X-Service-Auth)`,
    );
    res.status(401).json({ error: "Missing Authorization bearer token" });
    return false;
  }
  if (!PLUGIN_API_TOKENS.includes(token)) {
    const expectedFingerprints = PLUGIN_API_TOKENS.map((entry) => secretFingerprint(entry)).join(", ");
    console.warn(
      `[server.auth] ${routeLabel} denied: invalid server secret ` +
        `(incoming=${secretFingerprint(token)} hasBearer=${Boolean(bearerToken)} hasXServerSecret=${Boolean(headerServerSecret)} hasXServiceAuth=${Boolean(serviceToken)} expected=[${expectedFingerprints}])`,
    );
    res.status(403).json({ error: "Invalid server secret" });
    return false;
  }
  return true;
}

function requireServerSecret(req, res, routeLabel = "server_api") {
  if (!SERVER_SECRET) {
    console.warn(`[server.auth] ${routeLabel} denied: SERVER_SECRET not configured`);
    res.status(503).json({ error: "server_secret_not_configured" });
    return false;
  }
  const authHeader = String(req.headers?.authorization || "");
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const headerServerSecret = normalizeText(req.headers?.["x-server-secret"], 4096);
  const headerServiceAuth = normalizeText(req.headers?.["x-service-auth"], 4096);
  const token = bearerToken || headerServerSecret || headerServiceAuth;
  if (!token) {
    console.warn(
      `[server.auth] ${routeLabel} denied: missing_secret_header (accepted: Authorization Bearer / X-Server-Secret / X-Service-Auth)`,
    );
    res.status(403).json({
      error: "missing_authorization",
      acceptedHeaders: ["Authorization: Bearer <secret>", "X-Server-Secret: <secret>", "X-Service-Auth: <secret>"],
    });
    return false;
  }
  if (token !== SERVER_SECRET) {
    console.warn(
      `[server.auth] ${routeLabel} denied: invalid_server_secret ` +
        `(incoming=${secretFingerprint(token)} expected=${secretFingerprint(SERVER_SECRET)} hasBearer=${Boolean(bearerToken)} hasXServerSecret=${Boolean(headerServerSecret)} hasXServiceAuth=${Boolean(headerServiceAuth)})`,
    );
    res.status(403).json({ error: "invalid_server_secret" });
    return false;
  }
  recordServerHeartbeat(req, routeLabel);
  return true;
}

function parseBoundedInt(value, min = 0, max = 10000) {
  const next = Number(value);
  if (!Number.isFinite(next)) return null;
  const truncated = Math.trunc(next);
  if (truncated < min || truncated > max) return null;
  return truncated;
}

function parseServerIdFromHeartbeatRequest(req) {
  const raw =
    req.query?.serverId ||
    req.query?.server ||
    req.body?.serverId ||
    req.body?.server ||
    req.headers?.["x-server-id"] ||
    DEFAULT_SERVER_ID;
  const normalized = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 40);
  return normalized || DEFAULT_SERVER_ID;
}

function parseHeartbeatPlayerCount(req) {
  const candidates = [
    req.query?.playerCount,
    req.query?.players,
    req.query?.onlinePlayers,
    req.query?.online,
    req.body?.playerCount,
    req.body?.players,
    req.body?.onlinePlayers,
    req.body?.online,
  ];
  for (const value of candidates) {
    const parsed = parseBoundedInt(value, 0, 20000);
    if (parsed !== null) return parsed;
  }
  return null;
}

function parseHeartbeatMaxPlayers(req) {
  const candidates = [
    req.query?.maxPlayers,
    req.query?.capacity,
    req.body?.maxPlayers,
    req.body?.capacity,
  ];
  for (const value of candidates) {
    const parsed = parseBoundedInt(value, 1, 20000);
    if (parsed !== null) return parsed;
  }
  return null;
}

function recordServerHeartbeat(req, routeLabel = "server_api") {
  const nowMs = Date.now();
  const serverId = parseServerIdFromHeartbeatRequest(req);
  const playerCount = parseHeartbeatPlayerCount(req);
  const maxPlayers = parseHeartbeatMaxPlayers(req);
  const previous = serverHeartbeatById.get(serverId) || {
    serverId,
    playerCount: null,
    maxPlayers: null,
    lastSeenAtMs: 0,
    lastRoute: "",
  };
  const next = {
    ...previous,
    serverId,
    lastSeenAtMs: nowMs,
    lastRoute: String(routeLabel || "server_api"),
  };
  if (playerCount !== null) next.playerCount = playerCount;
  if (maxPlayers !== null) next.maxPlayers = maxPlayers;
  if (next.maxPlayers !== null && next.playerCount !== null && next.playerCount > next.maxPlayers) {
    next.playerCount = next.maxPlayers;
  }
  serverHeartbeatById.set(serverId, next);
}

function resolvePublicServerHeartbeat(nowMs = Date.now()) {
  const preferred = serverHeartbeatById.get(DEFAULT_SERVER_ID);
  const selected = preferred
    ? preferred
    : Array.from(serverHeartbeatById.values()).sort((a, b) => (b.lastSeenAtMs || 0) - (a.lastSeenAtMs || 0))[0] || null;
  if (!selected || !selected.lastSeenAtMs) {
    return {
      serverId: DEFAULT_SERVER_ID,
      status: "offline",
      online: false,
      playerCount: null,
      maxPlayers: null,
      lastSeenAt: "",
      staleAfterMs: SERVER_HEARTBEAT_STALE_AFTER_MS,
      heartbeatIntervalMs: SERVER_HEARTBEAT_INTERVAL_MS,
    };
  }
  const ageMs = Math.max(0, nowMs - selected.lastSeenAtMs);
  const online = ageMs <= SERVER_HEARTBEAT_STALE_AFTER_MS;
  return {
    serverId: selected.serverId || DEFAULT_SERVER_ID,
    status: online ? "online" : "offline",
    online,
    playerCount: online ? (selected.playerCount ?? null) : null,
    maxPlayers: online ? (selected.maxPlayers ?? null) : null,
    lastSeenAt: new Date(selected.lastSeenAtMs).toISOString(),
    ageMs,
    lastRoute: selected.lastRoute || "",
    staleAfterMs: SERVER_HEARTBEAT_STALE_AFTER_MS,
    heartbeatIntervalMs: SERVER_HEARTBEAT_INTERVAL_MS,
  };
}

function resolveRequestBaseUrl(req) {
  if (STRIPE_CHECKOUT_BASE_URL) {
    return STRIPE_CHECKOUT_BASE_URL.replace(/\/+$/, "");
  }
  const forwardedProto = normalizeText(req.headers?.["x-forwarded-proto"], 20).toLowerCase();
  const protocol = forwardedProto || req.protocol || "https";
  const host = normalizeText(req.headers?.["x-forwarded-host"] || req.get("host"), 255);
  if (!host) return "";
  return `${protocol}://${host}`.replace(/\/+$/, "");
}

function toStripeUnitAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.max(0, Math.round(amount * 100));
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function processCartCheckout(userId, options = {}) {
  const purchaseIdHint = normalizeText(options?.purchaseId, 128);
  const purchaseProvider = normalizeText(options?.purchaseProvider, 40) || "LOCAL";
  const paymentStatus = normalizeText(options?.paymentStatus, 40) || "PAID";
  const stripeSessionId = normalizeText(options?.stripeSessionId, 160);
  const stripePaymentIntentId = normalizeText(options?.stripePaymentIntentId, 160);
  const linked = await getEffectiveLinkedAccountForUserId(userId);
  if (!linked) {
    throw createHttpError(403, "Link your game account before checkout");
  }

  const cart = await cartsCollection.findOne({ userId });
  const items = normalizeCartItems(cart?.items || []);
  if (items.length === 0) {
    throw createHttpError(400, "Cart is empty");
  }

  const user = await clerkClient.users.getUser(userId);
  const currentOwnedRank = applyLinkedOwnedRankFloor(user?.publicMetadata?.rank, true);
  const pricing = calculateCartPricing(items, currentOwnedRank);
  const purchasedHighestRank = getHighestRankFromItems(items);

  let awardedRank = "";
  if (purchasedHighestRank) {
    const currentRank = String(user?.publicMetadata?.rank || "Unregistered");
    awardedRank = maxRankLabel(currentRank, purchasedHighestRank);
    if (awardedRank !== currentRank) {
      const nextMetadata = {
        ...user.publicMetadata,
        rank: awardedRank,
      };
      const nextDisplayRank = resolveDisplayRankFromMetadata(
        nextMetadata,
        isAdminUser(user),
        true,
      ).displayRank;
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: nextMetadata,
      });
      await commentsCollection.updateMany(
        { userId, isDeleted: false },
        { $set: { authorRank: nextDisplayRank, updatedAt: new Date() } },
      );
    }
  }

  const purchaseId = purchaseIdHint || crypto.randomUUID();
  const nowIso = new Date().toISOString();
  try {
    await purchasesCollection.insertOne({
      id: purchaseId,
      purchaseId,
      userId,
      uuid: normalizePlayerUuid(linked?.playerUuid),
      grants: buildFulfillmentGrants(items),
      status: paymentStatus,
      fulfilled: false,
      provider: purchaseProvider,
      stripeSessionId: stripeSessionId || null,
      stripePaymentIntentId: stripePaymentIntentId || null,
      items,
      total: pricing.total,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      awardedRank: awardedRank || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  } catch (error) {
    if (error?.code === 11000 && purchaseIdHint) {
      const existing = await purchasesCollection.findOne({ purchaseId: purchaseIdHint });
      if (existing) {
        return {
          purchaseId: normalizeText(existing.purchaseId || existing.id, 128),
          awardedRank: normalizeText(existing.awardedRank, 20) || null,
          cartItems: normalizeCartItems([]),
          alreadyProcessed: true,
        };
      }
    }
    throw error;
  }

  await cartsCollection.updateOne(
    { userId },
    {
      $set: {
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );

  return {
    purchaseId,
    awardedRank: awardedRank || null,
    cartItems: [],
    pricing,
    alreadyProcessed: false,
  };
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

function normalizeUuidList(value) {
  const raw = Array.isArray(value) ? value.join(",") : String(value || "");
  return raw
    .split(",")
    .map((entry) => normalizePlayerUuid(entry))
    .filter(Boolean);
}

function normalizeLinkCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

function normalizePlayerUuid(value) {
  const compact = String(value || "")
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "");
  if (compact.length !== 32) return "";
  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
}

function maskPlayerUuid(value) {
  const uuid = normalizePlayerUuid(value);
  if (!uuid) return "";
  return `${uuid.slice(0, 8)}-****-****-****-${uuid.slice(-12)}`;
}

function generateLinkCode() {
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    const index = Math.floor(Math.random() * LINK_CODE_ALPHABET.length);
    code += LINK_CODE_ALPHABET[index];
  }
  return code;
}

async function createHostedLinkCode({ playerUuid, playerName }) {
  if (!linkCodesCollection) {
    return { ok: false, status: 503, code: "SERVER_UNAVAILABLE", error: "Link code storage is unavailable" };
  }
  const uuid = normalizePlayerUuid(playerUuid);
  if (!uuid) {
    return { ok: false, status: 400, code: "INVALID_UUID", error: "playerUuid is invalid" };
  }
  const safeName = normalizeText(playerName || "", 60);
  const now = new Date();
  const existing = await linkCodesCollection.findOne({
    playerUuid: uuid,
    status: "pending",
    expiresAt: { $gt: now },
  });
  if (existing?.code) {
    return {
      ok: true,
      reused: true,
      code: normalizeLinkCode(existing.code),
      expiresAt: existing.expiresAt instanceof Date ? existing.expiresAt.toISOString() : "",
    };
  }

  const expiresAt = new Date(Date.now() + LINK_CODE_TTL_SEC * 1000);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateLinkCode();
    try {
      await linkCodesCollection.insertOne({
        code,
        playerUuid: uuid,
        playerName: safeName,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        expiresAt,
      });
      return { ok: true, reused: false, code, expiresAt: expiresAt.toISOString() };
    } catch (error) {
      if (error?.code === 11000) continue;
      throw error;
    }
  }
  return { ok: false, status: 503, code: "SERVER_UNAVAILABLE", error: "Failed to allocate unique link code" };
}

async function claimHostedLinkCode({ code, webUserId }) {
  if (!linkCodesCollection) {
    return { ok: false, status: 503, code: "SERVER_UNAVAILABLE", error: "Link code storage is unavailable" };
  }
  const normalizedCode = normalizeLinkCode(code);
  if (normalizedCode.length !== 8) {
    return { ok: false, status: 400, code: "INVALID_CODE", error: "Link code must be 8 letters/numbers" };
  }
  const now = new Date();
  const found = await linkCodesCollection.findOne({ code: normalizedCode });
  if (!found) {
    return { ok: false, status: 404, code: "NOT_FOUND", error: "Link code not found" };
  }
  if (found.status === "completed") {
    return { ok: false, status: 409, code: "ALREADY_USED", error: "Link code was already completed" };
  }
  if (found.status === "failed") {
    return { ok: false, status: 409, code: "FAILED", error: "Link code was previously marked failed" };
  }
  if (found.expiresAt instanceof Date && found.expiresAt.getTime() <= now.getTime()) {
    await linkCodesCollection.updateOne(
      { code: normalizedCode, status: { $in: ["pending", "claimed"] } },
      { $set: { status: "expired", updatedAt: now } },
    );
    return { ok: false, status: 400, code: "EXPIRED_CODE", error: "Link code expired" };
  }
  if (found.status === "claimed" && found.claimedByUserId && found.claimedByUserId !== webUserId) {
    return { ok: false, status: 409, code: "ALREADY_USED", error: "Link code was already claimed" };
  }
  const linkedUuid = normalizePlayerUuid(found.playerUuid);
  if (!linkedUuid) {
    return { ok: false, status: 502, code: "DOWNSTREAM_FAILURE", error: "Link code record missing player UUID" };
  }

  const existingByUser = await linkedAccountsCollection.findOne({ webUserId: webUserId });
  if (existingByUser && existingByUser.playerUuid && normalizePlayerUuid(existingByUser.playerUuid) !== linkedUuid) {
    return { ok: false, status: 409, code: "ALREADY_LINKED", error: "Your web account is already linked to another UUID" };
  }
  const existingByPlayer = await linkedAccountsCollection.findOne({ playerUuid: linkedUuid });
  if (existingByPlayer?.webUserId && existingByPlayer.webUserId !== webUserId) {
    return { ok: false, status: 409, code: "ALREADY_LINKED", error: "That game account is already linked" };
  }

  const claimed = await linkCodesCollection.findOneAndUpdate(
    {
      code: normalizedCode,
      status: { $in: ["pending", "claimed"] },
      $or: [
        { claimedByUserId: { $exists: false } },
        { claimedByUserId: webUserId },
      ],
      expiresAt: { $gt: now },
    },
    {
      $set: {
        status: "claimed",
        claimedAt: now,
        claimedByUserId: webUserId,
        usedAt: now,
        usedByWebUserId: webUserId,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );
  if (!claimed) {
    const latest = await linkCodesCollection.findOne({ code: normalizedCode });
    if (latest?.status === "claimed" && latest.claimedByUserId && latest.claimedByUserId !== webUserId) {
      return { ok: false, status: 409, code: "ALREADY_USED", error: "Link code was already claimed" };
    }
    if (latest?.status === "completed") {
      return { ok: false, status: 409, code: "ALREADY_USED", error: "Link code was already completed" };
    }
    if (latest?.expiresAt instanceof Date && latest.expiresAt.getTime() <= now.getTime()) {
      return { ok: false, status: 400, code: "EXPIRED_CODE", error: "Link code expired" };
    }
    return { ok: false, status: 404, code: "NOT_FOUND", error: "Link code not found" };
  }
  return {
    ok: true,
    code: normalizedCode,
    status: "claimed",
    claimedByUserId: webUserId,
    expiresAt: claimed.expiresAt instanceof Date ? claimed.expiresAt.toISOString() : "",
    playerUuid: linkedUuid,
    playerName: normalizeText(claimed.playerName || found.playerName || "", 60),
  };
}

async function registerHostedLinkCode({ code, playerUuid, playerName = "", expiresAt }) {
  if (!linkCodesCollection) {
    return { ok: false, status: 503, code: "SERVER_UNAVAILABLE", error: "Link code storage is unavailable" };
  }
  const normalizedCode = normalizeLinkCode(code);
  if (normalizedCode.length !== 8) {
    return { ok: false, status: 400, code: "INVALID_CODE", error: "code must be 8 letters/numbers" };
  }
  const normalizedUuid = normalizePlayerUuid(playerUuid);
  if (!normalizedUuid) {
    return { ok: false, status: 400, code: "INVALID_UUID", error: "playerUuid is invalid" };
  }
  const now = new Date();
  const safeExpiry = expiresAt instanceof Date && Number.isFinite(expiresAt.getTime())
    ? expiresAt
    : new Date(Date.now() + LINK_CODE_TTL_SEC * 1000);
  if (safeExpiry.getTime() <= now.getTime()) {
    return { ok: false, status: 400, code: "INVALID_EXPIRY", error: "expiresAt must be in the future" };
  }
  const safeName = normalizeText(playerName, 60);
  try {
    await linkCodesCollection.updateOne(
      { code: normalizedCode },
      {
        $set: {
          code: normalizedCode,
          playerUuid: normalizedUuid,
          playerName: safeName,
          status: "pending",
          updatedAt: now,
          expiresAt: safeExpiry,
        },
        $setOnInsert: {
          createdAt: now,
        },
        $unset: {
          claimedByUserId: "",
          claimedAt: "",
          completedAt: "",
          failedAt: "",
          error: "",
        },
      },
      { upsert: true },
    );
    return {
      ok: true,
      code: normalizedCode,
      playerUuid: normalizedUuid,
      expiresAt: safeExpiry.toISOString(),
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { ok: false, status: 409, code: "ALREADY_USED", error: "Link code already exists" };
    }
    throw error;
  }
}

function normalizeLinkCodeDocStatus(doc, now = Date.now()) {
  if (!doc) return "missing";
  const status = normalizeText(doc.status || "", 20).toLowerCase();
  if (status) return status;
  const expiresAtMs = doc.expiresAt instanceof Date ? doc.expiresAt.getTime() : 0;
  if (expiresAtMs > 0 && expiresAtMs <= now) return "expired";
  if (doc.claimedByUserId) return "claimed";
  return "pending";
}

async function enqueueFulfillmentJob({
  jobId,
  playerUuid = "",
  userId = "",
  payload = {},
  source = "stripe",
}) {
  if (!fulfillmentJobsCollection) {
    return { ok: false, status: 503, error: "fulfillment_jobs collection unavailable" };
  }
  const normalizedJobId = normalizeText(jobId || "", 160);
  if (!normalizedJobId) {
    return { ok: false, status: 400, error: "jobId is required" };
  }
  const normalizedUuid = normalizePlayerUuid(playerUuid);
  const normalizedUserId = normalizeText(userId || "", 128);
  const now = new Date().toISOString();
  const payloadSafe = payload && typeof payload === "object" ? payload : {};
  try {
    await fulfillmentJobsCollection.insertOne({
      jobId: normalizedJobId,
      playerUuid: normalizedUuid || "",
      userId: normalizedUserId || "",
      payload: payloadSafe,
      source: normalizeText(source, 40) || "stripe",
      status: "pending",
      error: "",
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true, alreadyExists: false, jobId: normalizedJobId };
  } catch (error) {
    if (error?.code === 11000) {
      return { ok: true, alreadyExists: true, jobId: normalizedJobId };
    }
    throw error;
  }
}

async function enqueueGrant({
  playerUuid = "",
  userId = "",
  type = "PERK",
  value = "",
  payload = {},
  serverId = "prod",
  idempotencyKey = "",
}) {
  if (!grantsCollection) {
    return { ok: false, status: 503, error: "grants collection unavailable" };
  }
  const now = new Date();
  const doc = {
    grantId: `grant_${crypto.randomUUID()}`,
    playerUuid: normalizePlayerUuid(playerUuid),
    userId: normalizeText(userId || "", 128),
    type: normalizeText(type || "PERK", 30).toUpperCase(),
    value: normalizeText(value || "", 120),
    payload: payload && typeof payload === "object" ? payload : {},
    status: "PENDING",
    serverId: normalizeText(serverId || "prod", 40) || "prod",
    idempotencyKey: normalizeText(idempotencyKey || "", 200),
    createdAt: now,
    updatedAt: now,
  };
  if (!doc.idempotencyKey) delete doc.idempotencyKey;
  try {
    const inserted = await grantsCollection.insertOne(doc);
    return { ok: true, grantId: doc.grantId, id: String(inserted.insertedId || "") };
  } catch (error) {
    if (error?.code === 11000 && doc.idempotencyKey) {
      return { ok: true, duplicate: true };
    }
    throw error;
  }
}

function parseJsonSafely(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeLinkServiceErrorCode(code, status) {
  const normalized = normalizeText(code || "", 80)
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "");

  if (normalized === "INVALID_CODE") return "INVALID_CODE";
  if (normalized === "CODE_EXPIRED" || normalized === "EXPIRED_CODE") return "EXPIRED_CODE";
  if (normalized === "CODE_USED" || normalized === "ALREADY_USED") return "ALREADY_USED";
  if (normalized === "CODE_LOCKED" || normalized === "RATE_LIMITED") return "RATE_LIMITED";
  if (normalized === "CODE_REJECTED") return "INVALID_CODE";
  if (normalized === "ALREADY_LINKED") return "ALREADY_LINKED";
  if (normalized === "SERVER_UNAVAILABLE") return "SERVER_UNAVAILABLE";

  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "SERVER_UNAVAILABLE";
  if (status === 400) return "INVALID_CODE";
  if (status === 409) return "ALREADY_USED";
  return normalized || "";
}

async function redeemLinkCodeWithGameServer({ code, webUserId, idempotencyKey }) {
  if (!LINK_SERVICE_BASE_URL) {
    return { ok: false, status: 503, code: "SERVER_UNAVAILABLE", error: "Link service base URL is not configured" };
  }
  if (!LINK_SERVICE_AUTH_TOKEN) {
    return { ok: false, status: 503, code: "SERVER_UNAVAILABLE", error: "Link service auth token is not configured" };
  }

  const baseUrl = LINK_SERVICE_BASE_URL.replace(/\/+$/, "");
  const endpointPaths = LINK_SERVICE_REDEEM_PATHS.length > 0
    ? LINK_SERVICE_REDEEM_PATHS
    : ["/api/v1/link/redeem"];
  const requestBody = JSON.stringify({ code, webUserId });
  let lastNotFound = "";

  console.log("LINK_SERVICE_BASE_URL =", LINK_SERVICE_BASE_URL);
  console.log("Resolved redeem base URL =", baseUrl);

  for (const endpointPath of endpointPaths) {
    const endpoint = `${baseUrl}${endpointPath}`;
    console.log("Resolved redeem URL =", endpoint);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LINK_SERVICE_TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LINK_SERVICE_AUTH_TOKEN}`,
          "X-Service-Auth": LINK_SERVICE_AUTH_TOKEN,
          "X-Idempotency-Key": idempotencyKey,
        },
        body: requestBody,
        signal: controller.signal,
      });
      const rawBody = await response.text();
      const parsedBody = parseJsonSafely(rawBody);
      if (!response.ok) {
        if (response.status === 404) {
          lastNotFound = endpointPath;
          continue;
        }
        const mappedCode = normalizeLinkServiceErrorCode(parsedBody?.code, response.status);
        return {
          ok: false,
          status: response.status,
          code: mappedCode,
          error:
            normalizeText(parsedBody?.error || parsedBody?.message || rawBody || "Redeem failed", 200) ||
            "Redeem failed",
        };
      }
      return { ok: true, status: response.status, data: parsedBody || {} };
    } catch (error) {
      if (error?.name === "AbortError") {
        return { ok: false, status: 504, code: "SERVER_UNAVAILABLE", error: "Redeem request timed out" };
      }
      return {
        ok: false,
        status: 502,
        code: "SERVER_UNAVAILABLE",
        error: `Failed to reach link service at ${LINK_SERVICE_BASE_URL}`,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  const attempted = endpointPaths.join(", ");
  return {
    ok: false,
    status: 404,
    code: "SERVER_UNAVAILABLE",
    error: `Link service redeem endpoint not found. Tried: ${attempted}. Last missing path: ${lastNotFound || "n/a"}`,
  };
}

function buildMockRedeemResult({ code }) {
  const normalizedCode = normalizeLinkCode(code);
  if (normalizedCode.startsWith("EXP")) {
    return { ok: false, status: 400, code: "EXPIRED_CODE", error: "Mock mode: code expired" };
  }
  if (normalizedCode.startsWith("USED")) {
    return { ok: false, status: 409, code: "ALREADY_USED", error: "Mock mode: code already used" };
  }
  if (normalizedCode.startsWith("RATE")) {
    return { ok: false, status: 429, code: "RATE_LIMITED", error: "Mock mode: too many attempts" };
  }
  if (normalizedCode.startsWith("DOWN")) {
    return { ok: false, status: 503, code: "SERVER_UNAVAILABLE", error: "Mock mode: link service unavailable" };
  }

  const uuidSeed = crypto.createHash("sha256").update(`mock-link:${normalizedCode}`).digest("hex").slice(0, 32);
  const playerUuid = normalizePlayerUuid(uuidSeed);
  return {
    ok: true,
    status: 200,
    data: {
      playerUuid,
      playerName: `Mock-${normalizedCode.slice(-4)}`,
    },
  };
}

function resolveTestLinkOverrideForUser(user) {
  const username = String(user?.username || "")
    .trim()
    .toLowerCase();
  const email = String(getUserEmail(user) || "")
    .trim()
    .toLowerCase();
  if (!SMURFIS_TEST_LINK_USERNAMES.has(username) && !SMURFIS_TEST_LINK_EMAILS.has(email)) {
    return null;
  }
  return {
    linked: true,
    playerUuid: SMURFIS_TEST_LINK_UUID,
    maskedPlayerUuid: maskPlayerUuid(SMURFIS_TEST_LINK_UUID),
    playerName: "Smurfis",
    linkedAt: "2026-02-17T00:00:00.000Z",
    linkedSource: "testOverride",
  };
}

function formatUsernameForDisplay(value, limit = 80) {
  const username = normalizeText(value, limit);
  if (!username) return "";
  if (/[A-Z]/.test(username)) return username;
  return `${username.charAt(0).toUpperCase()}${username.slice(1)}`;
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
    formatUsernameForDisplay(user?.username, 80) ||
    normalizeText(getUserEmail(user), 80) ||
    normalizeText(user?.fullName, 80) ||
    "User"
  );
}

function usernameKey(value) {
  return normalizeText(value, 80)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function normalizeStaffRole(value) {
  const raw = normalizeText(value, 40).toLowerCase();
  if (!raw) return "";
  if (raw === "operator" || raw === "op") return "Operator";
  if (raw === "dev" || raw === "developer") return "Developer";
  if (raw === "admin" || raw === "administrator") return "Admin";
  if (raw === "mod" || raw === "moderator") return "Moderator";
  if (raw === "helper") return "Helper";
  if (raw === "staff") return "Staff";
  return "";
}

function resolveStaffRoleBaseForUser(user) {
  const metadataRole = normalizeStaffRole(user?.publicMetadata?.staffRole);
  if (metadataRole) return metadataRole;
  const mapped = DEFAULT_STAFF_ROLE_BY_USERNAME.get(usernameKey(user?.username));
  if (mapped) return mapped;
  if (ADMIN_USER_ID_SET.has(String(user?.id || ""))) return "Admin";
  const username = String(user?.username || "").trim().toLowerCase();
  if (username && ADMIN_USERNAME_SET.has(username)) return "Admin";
  if (
    ADMIN_EMAIL_SET.size > 0 &&
    user?.emailAddresses?.some((entry) => ADMIN_EMAIL_SET.has(entry.emailAddress?.toLowerCase()))
  ) {
    return "Admin";
  }
  return "";
}

async function persistLinkedAccountForUser({ userId, playerUuid, playerName, linkSource, codeLast4 = "" }) {
  const existingByPlayer = await linkedAccountsCollection.findOne({ playerUuid });
  if (existingByPlayer && existingByPlayer.webUserId !== userId) {
    return {
      ok: false,
      status: 409,
      code: "ALREADY_LINKED",
      error: "That game account is already linked to another web account",
    };
  }

  const existingByUser = await linkedAccountsCollection.findOne({ webUserId: userId });
  if (existingByUser && normalizePlayerUuid(existingByUser.playerUuid) === playerUuid) {
    return {
      ok: true,
      alreadyLinked: true,
      linkedAt: existingByUser.linkedAt || existingByUser.updatedAt || existingByUser.createdAt || new Date().toISOString(),
    };
  }

  const nowIso = new Date().toISOString();
  await linkedAccountsCollection.updateOne(
    { webUserId: userId },
    {
      $set: {
        webUserId: userId,
        playerUuid,
        playerName,
        linkSource: normalizeText(linkSource, 20).toUpperCase() || "CODE",
        linkedSource: normalizeText(linkSource, 20).toUpperCase() || "CODE",
        codeLast4: normalizeText(codeLast4, 8),
        updatedAt: nowIso,
        linkedAt: nowIso,
      },
      $setOnInsert: {
        createdAt: nowIso,
      },
    },
    { upsert: true },
  );

  return { ok: true, alreadyLinked: false, linkedAt: nowIso };
}

function getAllowedStaffRolePreviewOptions(baseRole) {
  switch (baseRole) {
    case "Operator":
      return ["Operator", "Developer", "Admin", "Moderator", "Helper", "Staff"];
    case "Developer":
      return ["Developer", "Admin", "Moderator", "Helper", "Staff"];
    case "Admin":
      return ["Admin", "Moderator", "Helper", "Staff"];
    case "Moderator":
      return ["Moderator", "Helper", "Staff"];
    case "Helper":
      return ["Helper", "Staff"];
    case "Staff":
      return ["Staff"];
    default:
      return [];
  }
}

function base64UrlToBuffer(value) {
  const input = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = input.padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function parseJwtCompact(token) {
  const raw = String(token || "").trim();
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(base64UrlToBuffer(parts[0]).toString("utf8"));
    const payload = JSON.parse(base64UrlToBuffer(parts[1]).toString("utf8"));
    return {
      raw,
      header,
      payload,
      signature: parts[2],
      signingInput: `${parts[0]}.${parts[1]}`,
    };
  } catch {
    return null;
  }
}

function readLinkJwtFromRequest(req) {
  const headerToken = normalizeText(req.headers?.["x-hytale-jwt"] || "", 4096);
  if (headerToken && headerToken.split(".").length === 3) return headerToken;
  const bodyToken = normalizeText(req.body?.hytaleJwt || req.body?.jwt || "", 4096);
  if (bodyToken && bodyToken.split(".").length === 3) return bodyToken;
  return "";
}

async function fetchHytaleJwksKeys() {
  if (!HYTALE_JWT_JWKS_URL) return [];
  if (hytaleJwksCache.expiresAt > Date.now() && Array.isArray(hytaleJwksCache.keys)) {
    return hytaleJwksCache.keys;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(HYTALE_JWT_JWKS_URL, { signal: controller.signal });
    if (!response.ok) return [];
    const data = await response.json().catch(() => ({}));
    const keys = Array.isArray(data?.keys) ? data.keys : [];
    hytaleJwksCache = {
      expiresAt: Date.now() + 5 * 60 * 1000,
      keys,
    };
    return keys;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function createPemFromJwk(jwk) {
  if (!jwk || typeof jwk !== "object") return null;
  if (jwk.x5c && Array.isArray(jwk.x5c) && jwk.x5c[0]) {
    return `-----BEGIN CERTIFICATE-----\n${jwk.x5c[0]}\n-----END CERTIFICATE-----`;
  }
  try {
    return crypto.createPublicKey({ key: jwk, format: "jwk" });
  } catch {
    return null;
  }
}

function verifyJwtHmac({ algorithm, signingInput, signatureB64Url, secret }) {
  const hmacAlg = algorithm === "HS512" ? "sha512" : algorithm === "HS384" ? "sha384" : "sha256";
  const digest = crypto
    .createHmac(hmacAlg, secret)
    .update(signingInput)
    .digest();
  const signature = base64UrlToBuffer(signatureB64Url);
  if (digest.length !== signature.length) return false;
  return crypto.timingSafeEqual(digest, signature);
}

function verifyJwtRsa({ algorithm, signingInput, signatureB64Url, keyLike }) {
  const verifyAlg = algorithm === "RS512" ? "RSA-SHA512" : algorithm === "RS384" ? "RSA-SHA384" : "RSA-SHA256";
  const verifier = crypto.createVerify(verifyAlg);
  verifier.update(signingInput);
  verifier.end();
  return verifier.verify(keyLike, base64UrlToBuffer(signatureB64Url));
}

async function verifyHytaleJwtToken(token) {
  const parsed = parseJwtCompact(token);
  if (!parsed) {
    return { ok: false, status: 401, code: "UNAUTHORIZED", error: "Invalid JWT format", branch: "jwt_invalid_format" };
  }
  const alg = normalizeText(parsed.header?.alg, 20).toUpperCase();
  if (!alg || alg === "NONE") {
    return { ok: false, status: 401, code: "UNAUTHORIZED", error: "Unsupported JWT algorithm", branch: "jwt_unsupported_alg" };
  }

  let signatureValid = false;
  if (alg.startsWith("HS")) {
    if (!HYTALE_JWT_SHARED_SECRET) {
      return { ok: false, status: 401, code: "UNAUTHORIZED", error: "JWT shared secret not configured", branch: "jwt_missing_shared_secret" };
    }
    signatureValid = verifyJwtHmac({
      algorithm: alg,
      signingInput: parsed.signingInput,
      signatureB64Url: parsed.signature,
      secret: HYTALE_JWT_SHARED_SECRET,
    });
  } else if (alg.startsWith("RS")) {
    const kid = normalizeText(parsed.header?.kid, 200);
    const jwks = await fetchHytaleJwksKeys();
    const jwk = jwks.find((entry) => normalizeText(entry?.kid, 200) === kid) || null;
    const keyLike = createPemFromJwk(jwk);
    if (!keyLike) {
      return { ok: false, status: 401, code: "UNAUTHORIZED", error: "JWT signing key not found", branch: "jwt_key_missing" };
    }
    signatureValid = verifyJwtRsa({
      algorithm: alg,
      signingInput: parsed.signingInput,
      signatureB64Url: parsed.signature,
      keyLike,
    });
  } else {
    return { ok: false, status: 401, code: "UNAUTHORIZED", error: "Unsupported JWT algorithm", branch: "jwt_unsupported_alg" };
  }

  if (!signatureValid) {
    return { ok: false, status: 401, code: "UNAUTHORIZED", error: "JWT signature invalid", branch: "jwt_signature_invalid" };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const skew = HYTALE_JWT_CLOCK_SKEW_SEC;
  const exp = Number(parsed.payload?.exp || 0);
  const nbf = Number(parsed.payload?.nbf || 0);
  if (exp && nowSec - skew > exp) {
    return { ok: false, status: 401, code: "UNAUTHORIZED", error: "JWT expired", branch: "jwt_expired" };
  }
  if (nbf && nowSec + skew < nbf) {
    return { ok: false, status: 401, code: "UNAUTHORIZED", error: "JWT not active yet", branch: "jwt_not_yet_valid" };
  }

  if (HYTALE_JWT_ISSUER) {
    const iss = normalizeText(parsed.payload?.iss || "", 255);
    if (iss !== HYTALE_JWT_ISSUER) {
      return { ok: false, status: 403, code: "FORBIDDEN", error: "JWT issuer mismatch", branch: "jwt_issuer_mismatch" };
    }
  }
  if (HYTALE_JWT_AUDIENCE) {
    const audRaw = parsed.payload?.aud;
    const audMatch =
      typeof audRaw === "string"
        ? audRaw === HYTALE_JWT_AUDIENCE
        : Array.isArray(audRaw)
        ? audRaw.includes(HYTALE_JWT_AUDIENCE)
        : false;
    if (!audMatch) {
      return { ok: false, status: 403, code: "FORBIDDEN", error: "JWT audience mismatch", branch: "jwt_audience_mismatch" };
    }
  }

  const playerUuid = normalizePlayerUuid(
    parsed.payload?.playerUuid ||
      parsed.payload?.playerUUID ||
      parsed.payload?.uuid ||
      parsed.payload?.playerId ||
      parsed.payload?.sub,
  );
  if (!playerUuid) {
    return { ok: false, status: 403, code: "FORBIDDEN", error: "JWT missing valid player UUID", branch: "jwt_missing_uuid" };
  }
  const playerName = normalizeText(
    parsed.payload?.playerName || parsed.payload?.username || parsed.payload?.name || "",
    60,
  );

  return {
    ok: true,
    playerUuid,
    playerName,
    payload: parsed.payload,
  };
}

function logLinkRedeemFailure(event, details = {}) {
  const safe = {
    event,
    status: Number(details.status || 0) || undefined,
    code: normalizeText(details.code || "", 60) || undefined,
    branch: normalizeText(details.branch || "", 120) || undefined,
    userId: normalizeText(details.userId || "", 128) || undefined,
    upstreamStatus: Number(details.upstreamStatus || 0) || undefined,
    source: normalizeText(details.source || "", 20) || undefined,
  };
  console.warn("[link.redeem]", JSON.stringify(safe));
}

function resolveStaffRoleForUser(user) {
  const baseRole = resolveStaffRoleBaseForUser(user);
  if (!baseRole) return "";
  const previewRole = normalizeStaffRole(user?.publicMetadata?.staffRolePreview);
  if (!previewRole || previewRole === baseRole) return baseRole;
  const options = getAllowedStaffRolePreviewOptions(baseRole);
  return options.includes(previewRole) ? previewRole : baseRole;
}

function isStaffUser(user) {
  return Boolean(resolveStaffRoleForUser(user));
}

function resolveStaffBadgeVisible(metadata = {}) {
  return metadata?.showStaffBadge !== false;
}

function resolveStaffBadgeIconVisible(metadata = {}) {
  return metadata?.showStaffBadgeIcon !== false;
}

function resolveStaffGradientVisible(metadata = {}) {
  return metadata?.showStaffGradient !== false;
}

function resolveRankEffectsVisible(metadata = {}) {
  return metadata?.showRankEffects !== false;
}

function resolveAvatarVfxVisible(metadata = {}) {
  return metadata?.showAvatarVfx !== false;
}

function resolveRankFontVisible(metadata = {}) {
  return metadata?.useRankFont === true;
}

function resolveDonorGradientVisible(metadata = {}) {
  return metadata?.showDonorGradient !== false;
}

function hasDonorOwnedRank(value) {
  return DONOR_RANK_SET.has(normalizeOwnedRank(value));
}

async function getFreshAuthorSnapshot(userId, cache = new Map()) {
  const key = normalizeText(userId, 128);
  if (!key) return null;
  if (cache.has(key)) return cache.get(key);
  try {
    const user = await clerkClient.users.getUser(key);
    const staffRole = resolveStaffRoleForUser(user);
    const linked = await isLinkedUserId(key);
    const rankInfo = resolveDisplayRankFromMetadata(
      user?.publicMetadata || {},
      Boolean(staffRole),
      linked,
    );
    const staffUser = Boolean(staffRole);
    const snapshot = {
      authorName: getUserDisplayName(user),
      authorUsername: formatUsernameForDisplay(user?.username, 80),
      authorEmail: getUserEmail(user),
      authorImage: user?.imageUrl || "",
      authorRank: rankInfo.displayRank,
      authorOwnedRank: rankInfo.ownedRank,
      authorIsStaff: staffUser,
      authorStaffRole: staffRole,
      authorShowStaffBadge: resolveStaffBadgeVisible(user?.publicMetadata || {}),
      authorShowStaffBadgeIcon: resolveStaffBadgeIconVisible(user?.publicMetadata || {}),
      authorShowStaffGradient: resolveStaffGradientVisible(user?.publicMetadata || {}),
      authorShowRankEffects: resolveRankEffectsVisible(user?.publicMetadata || {}),
      authorShowAvatarVfx: resolveAvatarVfxVisible(user?.publicMetadata || {}),
      authorUseRankFont: resolveRankFontVisible(user?.publicMetadata || {}),
      authorShowDonorGradient: resolveDonorGradientVisible(user?.publicMetadata || {}),
    };
    cache.set(key, snapshot);
    return snapshot;
  } catch {
    cache.set(key, null);
    return null;
  }
}

async function resolveNotificationAliasSourceUserId() {
  const sourceUsername = usernameKey(NOTIFICATION_PROFILE_ALIAS_SOURCE_USERNAME);
  if (!sourceUsername) return "";
  const now = Date.now();
  if (notificationAliasSourceCache.expiresAt > now) {
    return notificationAliasSourceCache.userId;
  }
  try {
    const result = await clerkClient.users.getUserList({
      query: NOTIFICATION_PROFILE_ALIAS_SOURCE_USERNAME,
      limit: 20,
    });
    const users = Array.isArray(result?.data) ? result.data : [];
    const match = users.find((entry) => usernameKey(entry?.username) === sourceUsername);
    const userId = normalizeText(match?.id, 128);
    notificationAliasSourceCache = {
      userId,
      expiresAt: now + 5 * 60 * 1000,
    };
    return userId;
  } catch {
    notificationAliasSourceCache = {
      userId: "",
      expiresAt: now + 30 * 1000,
    };
    return "";
  }
}

function shouldApplyNotificationAlias(item) {
  if (!item) return false;
  const authorUserId = normalizeText(item.authorUserId, 128);
  if (authorUserId) return false;
  const keys = [
    usernameKey(item.authorUsername),
    usernameKey(item.authorName),
    usernameKey(item.author),
  ].filter(Boolean);
  return keys.some((key) => NOTIFICATION_PROFILE_ALIAS_TARGETS.has(key));
}

async function applyNotificationAuthorAliases(list = []) {
  if (!Array.isArray(list) || list.length === 0) return list;
  if (!NOTIFICATION_PROFILE_ALIAS_SOURCE_USERNAME) return list;
  if (!list.some((item) => shouldApplyNotificationAlias(item))) return list;

  const sourceUserId = await resolveNotificationAliasSourceUserId();
  if (!sourceUserId) return list;

  const cache = new Map();
  const snapshot = await getFreshAuthorSnapshot(sourceUserId, cache);
  if (!snapshot) return list;

  return list.map((item) => {
    if (!shouldApplyNotificationAlias(item)) return item;
    return {
      ...item,
      author: snapshot.authorName,
      authorName: snapshot.authorName,
      authorUserId: sourceUserId,
      authorUsername: snapshot.authorUsername,
      authorImage: snapshot.authorImage,
      authorRank: snapshot.authorRank,
      authorOwnedRank: snapshot.authorOwnedRank,
      authorIsStaff: snapshot.authorIsStaff,
      authorStaffRole: snapshot.authorStaffRole,
      authorShowStaffBadge: snapshot.authorShowStaffBadge,
      authorShowStaffBadgeIcon: snapshot.authorShowStaffBadgeIcon,
      authorShowStaffGradient: snapshot.authorShowStaffGradient,
      authorShowRankEffects: snapshot.authorShowRankEffects,
      authorShowAvatarVfx: snapshot.authorShowAvatarVfx,
      authorUseRankFont: snapshot.authorUseRankFont,
      authorShowDonorGradient: snapshot.authorShowDonorGradient,
    };
  });
}

function hasAuthorSnapshotChanged(entry, snapshot) {
  if (!entry || !snapshot) return false;
  return (
    normalizeText(entry.authorName, 80) !== snapshot.authorName ||
    normalizeText(entry.authorUsername, 80) !== snapshot.authorUsername ||
    String(entry.authorEmail || "") !== String(snapshot.authorEmail || "") ||
    String(entry.authorImage || "") !== String(snapshot.authorImage || "") ||
    String(entry.authorRank || "Unregistered") !== String(snapshot.authorRank || "Unregistered") ||
    String(entry.authorOwnedRank || "Unregistered") !==
      String(snapshot.authorOwnedRank || "Unregistered") ||
    Boolean(entry.authorIsStaff) !== Boolean(snapshot.authorIsStaff) ||
    normalizeStaffRole(entry.authorStaffRole) !== normalizeStaffRole(snapshot.authorStaffRole) ||
    Boolean(entry.authorShowStaffBadge) !== Boolean(snapshot.authorShowStaffBadge) ||
    Boolean(entry.authorShowStaffBadgeIcon) !== Boolean(snapshot.authorShowStaffBadgeIcon) ||
    Boolean(entry.authorShowStaffGradient) !== Boolean(snapshot.authorShowStaffGradient) ||
    Boolean(entry.authorShowRankEffects) !== Boolean(snapshot.authorShowRankEffects) ||
    Boolean(entry.authorShowAvatarVfx) !== Boolean(snapshot.authorShowAvatarVfx) ||
    Boolean(entry.authorUseRankFont) !== Boolean(snapshot.authorUseRankFont) ||
    Boolean(entry.authorShowDonorGradient) !== Boolean(snapshot.authorShowDonorGradient)
  );
}

async function refreshCommentAuthorFields(comments = []) {
  if (!Array.isArray(comments) || comments.length === 0) return comments;
  const cache = new Map();
  const ops = [];
  const nextComments = [];

  for (const comment of comments) {
    if (!comment) continue;
    let nextComment = comment;
    let commentChanged = false;
    let repliesChanged = false;

    if (comment.userId) {
      const snapshot = await getFreshAuthorSnapshot(comment.userId, cache);
      if (snapshot && hasAuthorSnapshotChanged(comment, snapshot)) {
        nextComment = { ...nextComment, ...snapshot };
        commentChanged = true;
      }
    }

    const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
    const nextReplies = [];
    for (const reply of replies) {
      if (!reply) continue;
      let nextReply = reply;
      if (reply.userId) {
        const snapshot = await getFreshAuthorSnapshot(reply.userId, cache);
        if (snapshot && hasAuthorSnapshotChanged(reply, snapshot)) {
          nextReply = { ...nextReply, ...snapshot };
          repliesChanged = true;
        }
      }
      nextReplies.push(nextReply);
    }

    if (repliesChanged) {
      nextComment = { ...nextComment, replies: nextReplies };
    }

    if ((commentChanged || repliesChanged) && comment._id) {
      const setPayload = {};
      if (commentChanged) {
        setPayload.authorName = nextComment.authorName;
        setPayload.authorUsername = nextComment.authorUsername;
        setPayload.authorEmail = nextComment.authorEmail;
        setPayload.authorImage = nextComment.authorImage;
        setPayload.authorRank = nextComment.authorRank;
        setPayload.authorOwnedRank = nextComment.authorOwnedRank;
        setPayload.authorStaffRole = nextComment.authorStaffRole;
        setPayload.authorShowStaffBadge = nextComment.authorShowStaffBadge;
        setPayload.authorShowStaffBadgeIcon = nextComment.authorShowStaffBadgeIcon;
        setPayload.authorShowStaffGradient = nextComment.authorShowStaffGradient;
        setPayload.authorShowRankEffects = nextComment.authorShowRankEffects;
        setPayload.authorShowAvatarVfx = nextComment.authorShowAvatarVfx;
        setPayload.authorUseRankFont = nextComment.authorUseRankFont;
        setPayload.authorShowDonorGradient = nextComment.authorShowDonorGradient;
      }
      if (repliesChanged) {
        setPayload.replies = nextComment.replies;
      }
      ops.push({
        updateOne: {
          filter: { _id: comment._id },
          update: { $set: setPayload },
        },
      });
    }

    nextComments.push(nextComment);
  }

  if (ops.length > 0 && commentsCollection) {
    await commentsCollection.bulkWrite(ops, { ordered: false });
  }
  return nextComments;
}

async function refreshNewsAuthorFields(news = []) {
  if (!Array.isArray(news) || news.length === 0) return news;
  const cache = new Map();
  const ops = [];
  const nextNews = [];

  for (const item of news) {
    if (!item) continue;
    let nextItem = item;
    const authorUserId = normalizeText(item.authorUserId, 128);
    if (authorUserId) {
      const snapshot = await getFreshAuthorSnapshot(authorUserId, cache);
      if (snapshot) {
        const authorChanged =
          normalizeText(item.author, 80) !== snapshot.authorName ||
          normalizeText(item.authorUsername, 80) !== snapshot.authorUsername ||
          String(item.authorImage || "") !== String(snapshot.authorImage || "");
        if (authorChanged) {
          nextItem = {
            ...nextItem,
            author: snapshot.authorName,
            authorUsername: snapshot.authorUsername,
            authorImage: snapshot.authorImage,
          };
          if (item._id) {
            ops.push({
              updateOne: {
                filter: { _id: item._id },
                update: {
                  $set: {
                    author: nextItem.author,
                    authorUsername: nextItem.authorUsername,
                    authorImage: nextItem.authorImage,
                    updatedAt: new Date().toISOString(),
                  },
                },
              },
            });
          }
        }
      }
    }
    nextNews.push(nextItem);
  }

  if (ops.length > 0 && newsCollection) {
    await newsCollection.bulkWrite(ops, { ordered: false });
  }
  return nextNews;
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

function toCurrencyNumberFromCents(cents) {
  return Math.max(0, Number(cents || 0)) / 100;
}

function calculateCartPricing(items = [], ownedRank = "Unregistered") {
  const ownedTier = STORE_RANK_BY_LABEL[normalizeOwnedRank(ownedRank)] || 0;
  let subtotalCents = 0;
  let discountCents = 0;
  const lines = [];

  for (const entry of items) {
    const product = STORE_RANK_PRODUCTS[entry?.id];
    if (!product) continue;
    const lineSubtotalCents = toStripeUnitAmount(product.price);
    let lineDiscountCents = 0;
    if (product.tier && ownedTier > 0 && product.tier > ownedTier) {
      const ownedProduct = STORE_RANK_PRODUCT_BY_TIER[ownedTier];
      lineDiscountCents = toStripeUnitAmount(ownedProduct?.price || 0);
      if (lineDiscountCents > lineSubtotalCents) {
        lineDiscountCents = lineSubtotalCents;
      }
    }
    const lineTotalCents = Math.max(0, lineSubtotalCents - lineDiscountCents);
    subtotalCents += lineSubtotalCents;
    discountCents += lineDiscountCents;
    lines.push({
      id: product.id,
      name: product.name,
      rank: product.rank,
      subtotal: toCurrencyNumberFromCents(lineSubtotalCents),
      discount: toCurrencyNumberFromCents(lineDiscountCents),
      total: toCurrencyNumberFromCents(lineTotalCents),
      isUpgradeDiscount: lineDiscountCents > 0,
    });
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);
  return {
    ownedRank: normalizeOwnedRank(ownedRank) || "Unregistered",
    subtotal: toCurrencyNumberFromCents(subtotalCents),
    discount: toCurrencyNumberFromCents(discountCents),
    total: toCurrencyNumberFromCents(totalCents),
    subtotalCents,
    discountCents,
    totalCents,
    lines,
  };
}

function buildFulfillmentGrants(items = []) {
  const grants = [];
  const highestRank = getHighestRankFromItems(items);
  if (highestRank) {
    grants.push({
      type: "rank",
      id: highestRank,
    });
  }
  for (const entry of items) {
    const id = normalizeText(entry?.id, 80);
    if (!id) continue;
    grants.push({
      type: "store_item",
      id,
    });
  }
  return grants;
}

function maxRankLabel(currentRank, nextRank) {
  const currentTier = STORE_RANK_BY_LABEL[currentRank] || 0;
  const nextTier = STORE_RANK_BY_LABEL[nextRank] || 0;
  return nextTier > currentTier ? nextRank : currentRank;
}

function normalizeDisplayTitle(value) {
  const title = normalizeText(value, 20);
  if (title === STAFF_DISPLAY_TITLE) return STAFF_DISPLAY_TITLE;
  return DISPLAY_TITLES.includes(title) ? title : "";
}

function normalizeOwnedRank(value) {
  const rank = normalizeText(value, 20);
  return OWNED_RANKS.includes(rank) ? rank : "";
}

function applyLinkedOwnedRankFloor(ownedRank, linked = false) {
  const normalized = normalizeOwnedRank(ownedRank) || "Unregistered";
  if (!linked) return normalized;
  return normalized === "Unregistered" ? "Registered" : normalized;
}

function getOwnedDonorBadgeOptions(ownedRank) {
  const tierByRank = { Hero: 1, Legend: 2, Mythic: 3 };
  const safeOwned = normalizeOwnedRank(ownedRank) || "Unregistered";
  const maxTier = tierByRank[safeOwned] || 0;
  return DONOR_BADGE_ORDER.filter((rank) => (tierByRank[rank] || 0) <= maxTier);
}

function resolveShowAllOwnedRankBadgesVisible(metadata = {}) {
  return metadata?.showAllOwnedRankBadges !== false;
}

function resolveSelectedOwnedBadge(metadata = {}, ownedRank = "Unregistered") {
  const options = getOwnedDonorBadgeOptions(ownedRank);
  if (options.length === 0) return "";
  const preferred = normalizeOwnedRank(metadata?.selectedOwnedBadge);
  if (preferred && options.includes(preferred)) return preferred;
  return options[options.length - 1];
}

function getUnlockedDisplayTitles(ownedRank) {
  const normalizedOwned = normalizeOwnedRank(ownedRank) || "Unregistered";
  if (normalizedOwned === "Unregistered") return [];
  const maxTier = DISPLAY_TITLE_TIER[normalizedOwned] ?? 0;
  return DISPLAY_TITLES.filter((title) => (DISPLAY_TITLE_TIER[title] ?? 0) <= maxTier);
}

function resolveDisplayRankFromMetadata(metadata = {}, includeAllTitles = false, linked = false) {
  const ownedRank = applyLinkedOwnedRankFloor(metadata?.rank, linked);
  const baseTitles = includeAllTitles ? [...DISPLAY_TITLES] : getUnlockedDisplayTitles(ownedRank);
  const availableTitles = includeAllTitles
    ? [STAFF_DISPLAY_TITLE, ...baseTitles]
    : baseTitles;
  const preferred = normalizeDisplayTitle(metadata?.displayRank);
  const displayRank =
    preferred && availableTitles.includes(preferred)
      ? preferred
      : includeAllTitles
      ? STAFF_DISPLAY_TITLE
      : ownedRank === "Unregistered"
      ? "Unregistered"
      : ownedRank;
  return { ownedRank, displayRank, availableTitles };
}

function normalizeGroupLabel(value, max = 40) {
  return normalizeText(value, max);
}

function getMetadataGroupList(metadata = {}) {
  const keys = ["groups", "groupMemberships", "staffGroups"];
  const values = [];
  for (const key of keys) {
    const raw = metadata?.[key];
    if (!Array.isArray(raw)) continue;
    for (const entry of raw) {
      const label = normalizeGroupLabel(entry);
      if (!label) continue;
      values.push(label);
    }
  }
  return values;
}

function buildProfileGroupsForUser(user, options = {}) {
  const linked = options?.linked === true;
  const metadata = user?.publicMetadata || {};
  const isSmurfisOverride = Boolean(resolveTestLinkOverrideForUser(user));
  const staffRole = resolveStaffRoleForUser(user);
  const isStaff = Boolean(staffRole);
  const rankInfo = resolveDisplayRankFromMetadata(metadata, isStaff, linked);
  const set = new Set();
  const ordered = [];

  function addGroup(label) {
    const value = normalizeGroupLabel(label);
    if (!value) return;
    const key = value.toLowerCase();
    if (set.has(key)) return;
    set.add(key);
    ordered.push(value);
  }

  for (const label of getMetadataGroupList(metadata)) {
    addGroup(label);
  }

  if (isStaff) addGroup("Staff");
  if (staffRole) {
    if (staffRole === "Admin") addGroup("Administrator");
    else addGroup(staffRole);
  }
  if (isSmurfisOverride) {
    addGroup("Developer");
    addGroup("Administrator");
    addGroup("Moderator");
    addGroup("Helper");
    addGroup("Staff");
  }
  if (rankInfo.ownedRank && rankInfo.ownedRank !== "Unregistered") addGroup(rankInfo.ownedRank);
  if (rankInfo.displayRank && rankInfo.displayRank !== "Unregistered") addGroup(rankInfo.displayRank);
  addGroup(linked ? "Linked" : "Unlinked");

  return ordered;
}

async function isLinkedUserId(userId) {
  const linked = await getEffectiveLinkedAccountForUserId(userId);
  return Boolean(linked);
}

async function getEffectiveLinkedAccountForUserId(userId) {
  const id = normalizeText(userId, 128);
  if (!id || !linkedAccountsCollection) return null;
  const doc = await linkedAccountsCollection.findOne({ webUserId: id });
  if (doc) return doc;
  const authUser = await clerkClient.users.getUser(id).catch(() => null);
  const override = resolveTestLinkOverrideForUser(authUser);
  if (!override) return null;
  return {
    webUserId: id,
    playerUuid: override.playerUuid,
    playerName: override.playerName,
    linkedAt: override.linkedAt,
    linkedSource: override.linkedSource,
  };
}

function buildAchievementCatalogWithState(unlockedRows = [], options = {}) {
  const unlockedMap = new Map();
  for (const row of unlockedRows) {
    const key = normalizeText(row?.key, 80);
    if (!key) continue;
    unlockedMap.set(key, String(row?.unlockedAt || ""));
  }
  const linkedState = options?.linked === true ? "linked" : options?.linked === false ? "unlinked" : "";
  return ACHIEVEMENT_DEFS.map((item) => {
    let unlockedAt = unlockedMap.get(item.key) || "";
    if (item.key === "linked_state") {
      unlockedAt = linkedState === "linked" ? "state-active" : "";
    } else if (item.key === "unlinked_state") {
      unlockedAt = linkedState === "unlinked" ? "state-active" : "";
    }
    return {
      key: item.key,
      title: item.title,
      description: item.description,
      icon: item.icon,
      unlocked: Boolean(unlockedAt),
      unlockedAt,
      locked: !unlockedAt,
      status: unlockedAt ? "COMPLETE" : "INCOMPLETE",
    };
  });
}

async function getUserAchievements(userId) {
  const safeUserId = normalizeText(userId, 128);
  if (!safeUserId || !userAchievementsCollection) {
    return buildAchievementCatalogWithState([]);
  }
  await userAchievementsCollection.updateMany(
    {
      userId: safeUserId,
      $or: [
        { title: { $exists: true } },
        { description: { $exists: true } },
        { icon: { $exists: true } },
        { status: { $exists: true } },
        { locked: { $exists: true } },
        { unlocked: { $exists: true } },
      ],
    },
    {
      $unset: {
        title: "",
        description: "",
        icon: "",
        status: "",
        locked: "",
        unlocked: "",
      },
    },
  ).catch(() => {});
  const linked = await isLinkedUserId(safeUserId);
  const rows = await userAchievementsCollection
    .find({ userId: safeUserId })
    .project({ key: 1, unlockedAt: 1 })
    .toArray();
  return buildAchievementCatalogWithState(rows, { linked });
}

async function notifyAchievementUnlocked(userId, achievement) {
  if (!notificationsCollection || !achievement || !userId) return;
  const now = new Date().toISOString();
  await notificationsCollection.insertOne({
    id: crypto.randomUUID(),
    title: "Achievement Unlocked",
    message: `${achievement.title} completed`,
    author: "System",
    authorName: "System",
    authorUserId: "",
    authorUsername: "",
    authorImage: "",
    authorRank: "Registered",
    authorOwnedRank: "Registered",
    authorShowStaffBadge: false,
    authorShowStaffBadgeIcon: false,
    authorShowStaffGradient: false,
    authorUseRankFont: false,
    authorShowDonorGradient: false,
    featured: false,
    type: "achievement_unlock",
    targetUserId: normalizeText(userId, 128),
    readMoreUrl: "",
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  });
  await pruneCollection(notificationsCollection, 120);
}

async function unlockAchievement(userId, key, { notify = true } = {}) {
  const safeUserId = normalizeText(userId, 128);
  const achievementKey = normalizeText(key, 80);
  if (!safeUserId || !achievementKey || !userAchievementsCollection) return false;
  const now = new Date().toISOString();
  const result = await userAchievementsCollection.updateOne(
    { userId: safeUserId, key: achievementKey },
    {
      $setOnInsert: {
        userId: safeUserId,
        key: achievementKey,
        unlockedAt: now,
      },
      $set: {
        updatedAt: now,
      },
    },
    { upsert: true },
  );
  const inserted = Boolean(result?.upsertedCount);
  if (inserted && notify) {
    const achievement = ACHIEVEMENT_DEFS.find((entry) => entry.key === achievementKey);
    if (achievement) {
      await notifyAchievementUnlocked(safeUserId, achievement);
    }
  }
  return inserted;
}

function normalizeNewsItem(item) {
  const title = String(item?.title || "").trim().slice(0, 120);
  const description = String(item?.description || "").trim();
  const author = String(item?.author || "").trim().slice(0, 80);
  const readMoreUrl = String(item?.readMoreUrl || "").trim().slice(0, 500);
  const imageUrl = String(item?.imageUrl || "").trim().slice(0, 500);
  const featured = Boolean(item?.featured);
  const commentsLocked = Boolean(item?.commentsLocked);

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
    commentsLocked,
    createdAt: new Date().toISOString(),
  };
}

async function isNewsThreadLocked(newsId) {
  const key = normalizeText(newsId, 200);
  if (!key) return false;
  if (key.startsWith("forum:")) return false;
  if (!newsCollection) return false;
  const doc = await newsCollection.findOne(
    { id: key, isDeleted: false },
    { projection: { commentsLocked: 1 } },
  );
  return Boolean(doc?.commentsLocked);
}

function normalizeNotificationItem(item) {
  const title = String(item?.title || "").trim().slice(0, 120);
  const message = String(item?.message || "").trim().slice(0, 600);
  const author = String(item?.author || "").trim().slice(0, 80);
  const featured = Boolean(item?.featured);
  const readMoreUrl = String(item?.readMoreUrl || "").trim().slice(0, 500);
  const targetUserId = normalizeText(item?.targetUserId, 128);
  const type = normalizeText(item?.type, 40);
  const newsId = normalizeText(item?.newsId, 200);
  const commentId = normalizeText(item?.commentId, 128);
  const replyId = normalizeText(item?.replyId, 128);

  if (!title || !message || !author) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    title,
    message,
    author,
    featured,
    readMoreUrl,
    targetUserId,
    type,
    newsId,
    commentId,
    replyId,
    createdAt: new Date().toISOString(),
  };
}

async function resolveNotificationQueryForUser(userIdRaw) {
  const userId = normalizeText(userIdRaw, 128);
  let query = { isDeleted: false, $or: [{ targetUserId: { $exists: false } }, { targetUserId: "" }] };
  if (!userId) {
    return { userId: "", isAdmin: false, query };
  }
  let isAdmin = false;
  try {
    const user = await clerkClient.users.getUser(userId);
    isAdmin = isAdminUser(user);
  } catch {
    isAdmin = false;
  }
  if (isAdmin) {
    query = { isDeleted: false };
  } else {
    query = {
      isDeleted: false,
      $or: [
        { targetUserId: { $exists: false } },
        { targetUserId: "" },
        { targetUserId: userId },
      ],
    };
  }
  return { userId, isAdmin, query };
}

async function withNotificationReadState(list = [], userIdRaw = "") {
  const userId = normalizeText(userIdRaw, 128);
  const baseItems = stripMongoIdList(list);
  const items = await applyNotificationAuthorAliases(baseItems);
  if (!userId || items.length === 0) {
    return items.map((item) => ({ ...item, readByMe: false }));
  }
  const ids = items.map((item) => normalizeText(item?.id, 128)).filter(Boolean);
  if (ids.length === 0) {
    return items.map((item) => ({ ...item, readByMe: false }));
  }
  const reads = await notificationReadsCollection
    .find({ userId, notificationId: { $in: ids } })
    .project({ notificationId: 1 })
    .toArray();
  const readSet = new Set(reads.map((entry) => String(entry.notificationId || "")));
  return items.map((item) => ({
    ...item,
    readByMe: readSet.has(String(item.id || "")),
  }));
}

function normalizeTicketSubject(value) {
  return normalizeText(value, 140);
}

function normalizeTicketBody(value) {
  return normalizeText(value, 2000);
}

function normalizeTicketCategory(value) {
  const category = normalizeText(value, 40).toLowerCase();
  const allowed = new Set(["support", "appeal", "warning", "general"]);
  return allowed.has(category) ? category : "support";
}

function normalizeTicketStatus(value) {
  const status = normalizeText(value, 24).toLowerCase();
  const allowed = new Set(["open", "pending", "resolved", "closed"]);
  return allowed.has(status) ? status : "open";
}

function normalizeTicketMessage(message) {
  if (!message) return null;
  return {
    ...message,
    id: normalizeText(message.id, 128),
    body: normalizeTicketBody(message.body),
    authorId: normalizeText(message.authorId, 128),
    authorName: normalizeText(message.authorName, 80),
    role: normalizeText(message.role, 24),
    createdAt: message.createdAt || new Date().toISOString(),
  };
}

function normalizeTicketDoc(doc) {
  if (!doc) return null;
  const stripped = stripMongoId(doc);
  return {
    ...stripped,
    id: normalizeText(stripped.id, 128),
    subject: normalizeTicketSubject(stripped.subject),
    body: normalizeTicketBody(stripped.body),
    category: normalizeTicketCategory(stripped.category),
    status: normalizeTicketStatus(stripped.status),
    createdBy: normalizeText(stripped.createdBy, 128),
    createdByName: normalizeText(stripped.createdByName, 80),
    assigneeId: normalizeText(stripped.assigneeId, 128),
    messages: Array.isArray(stripped.messages)
      ? stripped.messages.map(normalizeTicketMessage).filter(Boolean)
      : [],
  };
}

function toTicketSummary(ticket) {
  if (!ticket) return null;
  return {
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    createdBy: ticket.createdBy,
    createdByName: ticket.createdByName,
    assigneeId: ticket.assigneeId || "",
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    messageCount: Array.isArray(ticket.messages) ? ticket.messages.length : 0,
  };
}

async function purgeClosedSupportTickets() {
  if (!supportTicketsCollection) return;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supportTicketsCollection.deleteMany({
    isDeleted: false,
    status: "closed",
    updatedAt: { $lte: cutoff },
  });
}

const FORUM_SECTION_SET = new Set([
  "updates",
  "bug-reports",
  "help-feedback",
  "suggestions",
  "feature-requests",
  "forum-help",
]);

function normalizeForumSection(value) {
  const section = normalizeText(value, 60).toLowerCase();
  return FORUM_SECTION_SET.has(section) ? section : "";
}

function normalizeForumTitle(value) {
  return normalizeText(value, 140);
}

function normalizeForumBody(value) {
  return normalizeText(value, 4000);
}

function normalizeForumBodyFormat(value) {
  const format = normalizeText(value, 20).toLowerCase();
  return format === "markdown" ? "markdown" : "plain";
}

function normalizeForumPost(doc) {
  if (!doc) return null;
  const stripped = stripMongoId(doc);
  const authorUsername = formatUsernameForDisplay(stripped.authorUsername, 80);
  const authorNameRaw = normalizeText(stripped.authorName, 80);
  const authorName =
    authorNameRaw &&
    authorUsername &&
    authorNameRaw.toLowerCase() === String(stripped.authorUsername || "").toLowerCase()
      ? authorUsername
      : authorNameRaw;
  return {
    ...stripped,
    id: normalizeText(stripped.id, 128),
    section: normalizeForumSection(stripped.section),
    title: normalizeForumTitle(stripped.title),
    body: normalizeForumBody(stripped.body),
    bodyFormat: normalizeForumBodyFormat(stripped.bodyFormat),
    createdBy: normalizeText(stripped.createdBy, 128),
    authorName,
    authorRank: normalizeText(stripped.authorRank, 20) || "Unregistered",
    authorOwnedRank: normalizeOwnedRank(stripped.authorOwnedRank) || "Unregistered",
    authorIsStaff: Boolean(stripped.authorIsStaff),
    authorStaffRole: normalizeStaffRole(stripped.authorStaffRole),
    authorUserId: normalizeText(stripped.authorUserId, 128),
    authorUsername,
    authorImage: String(stripped.authorImage || ""),
    authorShowStaffBadge: stripped.authorShowStaffBadge !== false,
    authorShowStaffBadgeIcon: stripped.authorShowStaffBadgeIcon !== false,
    authorShowStaffGradient: stripped.authorShowStaffGradient !== false,
    authorUseRankFont: stripped.authorUseRankFont === true,
    authorShowDonorGradient: stripped.authorShowDonorGradient !== false,
    editCount: Number.isFinite(Number(stripped.editCount)) ? Number(stripped.editCount) : 0,
    editedAt: stripped.editedAt || "",
    editedByUserId: normalizeText(stripped.editedByUserId, 128),
    editedByName: normalizeText(stripped.editedByName, 80),
    staffForcedEdit: Boolean(stripped.staffForcedEdit),
    staffForcedEditBy: normalizeText(stripped.staffForcedEditBy, 80),
    staffForcedEditAt: stripped.staffForcedEditAt || "",
    createdAt: stripped.createdAt || new Date().toISOString(),
    updatedAt: stripped.updatedAt || stripped.createdAt || new Date().toISOString(),
  };
}

async function refreshForumPostAuthorFields(posts = []) {
  if (!Array.isArray(posts) || posts.length === 0) return posts;
  const cache = new Map();
  const ops = [];
  const nextPosts = [];

  for (const item of posts) {
    if (!item) continue;
    let nextItem = item;
    const authorUserId = normalizeText(item.authorUserId, 128);
    if (authorUserId) {
      const snapshot = await getFreshAuthorSnapshot(authorUserId, cache);
      if (snapshot) {
        const authorChanged =
          normalizeText(item.authorName, 80) !== snapshot.authorName ||
          normalizeText(item.authorUsername, 80) !== snapshot.authorUsername ||
          String(item.authorImage || "") !== String(snapshot.authorImage || "") ||
          String(item.authorRank || "Unregistered") !== String(snapshot.authorRank || "Unregistered") ||
          String(item.authorOwnedRank || "Unregistered") !==
            String(snapshot.authorOwnedRank || "Unregistered") ||
          Boolean(item.authorIsStaff) !== Boolean(snapshot.authorIsStaff) ||
          normalizeStaffRole(item.authorStaffRole) !== normalizeStaffRole(snapshot.authorStaffRole) ||
          Boolean(item.authorShowStaffBadge) !== Boolean(snapshot.authorShowStaffBadge) ||
          Boolean(item.authorShowStaffBadgeIcon) !== Boolean(snapshot.authorShowStaffBadgeIcon) ||
          Boolean(item.authorShowStaffGradient) !== Boolean(snapshot.authorShowStaffGradient) ||
          Boolean(item.authorUseRankFont) !== Boolean(snapshot.authorUseRankFont) ||
          Boolean(item.authorShowDonorGradient) !== Boolean(snapshot.authorShowDonorGradient);
        if (authorChanged) {
          nextItem = {
            ...nextItem,
            authorName: snapshot.authorName,
            authorUsername: snapshot.authorUsername,
            authorImage: snapshot.authorImage,
            authorRank: snapshot.authorRank || "Unregistered",
            authorOwnedRank: snapshot.authorOwnedRank || "Unregistered",
            authorIsStaff: snapshot.authorIsStaff,
            authorStaffRole: snapshot.authorStaffRole || "",
            authorShowStaffBadge: snapshot.authorShowStaffBadge,
            authorShowStaffBadgeIcon: snapshot.authorShowStaffBadgeIcon,
            authorShowStaffGradient: snapshot.authorShowStaffGradient,
            authorUseRankFont: snapshot.authorUseRankFont,
            authorShowDonorGradient: snapshot.authorShowDonorGradient,
          };
          if (item._id) {
            ops.push({
              updateOne: {
                filter: { _id: item._id },
                update: {
                  $set: {
                    authorName: nextItem.authorName,
                    authorUsername: nextItem.authorUsername,
                    authorImage: nextItem.authorImage,
                    authorRank: nextItem.authorRank,
                    authorOwnedRank: nextItem.authorOwnedRank,
                    authorIsStaff: nextItem.authorIsStaff,
                    authorStaffRole: nextItem.authorStaffRole || "",
                    authorShowStaffBadge: nextItem.authorShowStaffBadge,
                    authorShowStaffBadgeIcon: nextItem.authorShowStaffBadgeIcon,
                    authorShowStaffGradient: nextItem.authorShowStaffGradient,
                    authorUseRankFont: nextItem.authorUseRankFont,
                    authorShowDonorGradient: nextItem.authorShowDonorGradient,
                    updatedAt: new Date().toISOString(),
                  },
                },
              },
            });
          }
        }
      }
    }
    nextPosts.push(nextItem);
  }

  if (ops.length > 0 && forumPostsCollection) {
    await forumPostsCollection.bulkWrite(ops, { ordered: false });
  }
  return nextPosts;
}

async function getAdminUser() {
  if (!ADMIN_NEWS_OWNER_EMAIL) return null;
  const { data } = await clerkClient.users.getUserList({
    emailAddress: [ADMIN_NEWS_OWNER_EMAIL],
  });
  return data?.[0] || null;
}

function isAdminUser(user) {
  if (!user) return false;
  const staffRole = resolveStaffRoleForUser(user);
  if (staffRole && TOP_STAFF_ROLE_SET.has(staffRole)) {
    return true;
  }
  if (ADMIN_USER_ID_SET.has(String(user.id || ""))) return true;
  const username = String(user.username || "").trim().toLowerCase();
  if (username && ADMIN_USERNAME_SET.has(username)) return true;
  if (ADMIN_EMAIL_SET.size === 0) return false;
  return user.emailAddresses?.some(
    (entry) => ADMIN_EMAIL_SET.has(entry.emailAddress?.toLowerCase()),
  );
}

async function fulfillStripeCheckoutSession(session, source = "manual") {
  const sessionId = normalizeText(session?.id, 160);
  if (!sessionId) {
    return { success: false, skipped: true, reason: "missing_session_id" };
  }
  const paymentStatus = String(session?.payment_status || "").toLowerCase();
  if (paymentStatus !== "paid") {
    return { success: false, skipped: true, reason: "payment_not_paid" };
  }
  const userId = normalizeText(session?.client_reference_id || session?.metadata?.userId, 128);
  if (!userId) {
    return { success: false, skipped: true, reason: "missing_user_id" };
  }
  const result = await processCartCheckout(userId, {
    purchaseId: sessionId,
    purchaseProvider: "STRIPE",
    paymentStatus: "PAID",
    stripeSessionId: sessionId,
    source,
  });
  return { success: true, ...result };
}

async function queueStripeFulfillmentFromSession(session, source = "stripe_webhook", stripeEventId = "") {
  const sessionId = normalizeText(session?.id, 160);
  if (!sessionId) {
    return { ok: false, skipped: true, reason: "missing_session_id" };
  }
  const paymentStatus = String(session?.payment_status || "").toLowerCase();
  if (paymentStatus !== "paid") {
    return { ok: false, skipped: true, reason: "payment_not_paid" };
  }
  const userId = normalizeText(session?.client_reference_id || session?.metadata?.userId, 128);
  if (!userId) {
    return { ok: false, skipped: true, reason: "missing_user_id" };
  }
  const linked = await linkedAccountsCollection.findOne(
    { webUserId: userId },
    { projection: { _id: 0, playerUuid: 1 } },
  );
  const playerUuid = normalizePlayerUuid(linked?.playerUuid);
  const cartItemIds = normalizeText(session?.metadata?.cartItemIds || "", 800)
    .split(",")
    .map((entry) => normalizeText(entry, 64))
    .filter(Boolean);
  const normalizedSource = normalizeText(source, 60) || "stripe_webhook";
  const paymentIntentId = normalizeText(session?.payment_intent, 160);
  const amountTotal = Number(session?.amount_total || 0);
  const currency = normalizeText(session?.currency, 20).toLowerCase();
  const itemIds = cartItemIds.length > 0 ? cartItemIds : ["rank-unknown"];
  const grants = [];
  for (let index = 0; index < itemIds.length; index += 1) {
    const itemId = itemIds[index];
    const product = STORE_RANK_PRODUCTS[itemId];
    const value = product?.rank ? String(product.rank).toUpperCase() : normalizeText(itemId, 80).toUpperCase();
    const payload = {
      source: normalizedSource,
      stripe: {
        sessionId,
        paymentIntentId,
        amountTotal,
        currency,
        itemId,
      },
    };
    const idempotencyKeyBase = normalizeText(stripeEventId || sessionId, 120) || sessionId;
    const grant = await enqueueGrant({
      playerUuid,
      userId,
      type: "RANK",
      value,
      payload,
      serverId: "prod",
      idempotencyKey: `${idempotencyKeyBase}:${index}:${itemId}`,
    });
    grants.push(grant);
  }
  return {
    ok: grants.some((entry) => entry?.ok),
    alreadyExists: grants.every((entry) => entry?.duplicate),
    skipped: false,
  };
}

async function handleStripeWebhook(req, res) {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!stripeClient || !STRIPE_ENABLED) {
      return res.status(503).json({ error: "Stripe checkout is not configured" });
    }
    if (!STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: "Stripe webhook secret is not configured" });
    }

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Missing Stripe signature" });
    }
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body || ""));
    let event;
    try {
      event = stripeClient.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    } catch {
      return res.status(400).json({ error: "Invalid Stripe signature" });
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data?.object || null;
      const queued = await queueStripeFulfillmentFromSession(
        session,
        `webhook:${event.type}`,
        normalizeText(event.id, 120),
      );
      return res.json({
        received: true,
        handled: true,
        eventId: normalizeText(event.id, 120),
        eventType: event.type,
        queued: Boolean(queued?.ok),
        alreadyQueued: Boolean(queued?.alreadyExists),
        skipped: Boolean(queued?.skipped),
        reason: normalizeText(queued?.reason || "", 80),
      });
    }
    return res.json({
      received: true,
      handled: false,
      eventId: normalizeText(event.id, 120),
      eventType: event.type,
    });
  } catch (error) {
    console.error("Failed to process Stripe webhook", error);
    return res.status(500).json({ error: "Failed to process Stripe webhook" });
  }
}

app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  handleStripeWebhook,
);

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  handleStripeWebhook,
);

app.use(express.json({ limit: "100kb" }));
const clerkApiMiddleware = clerkMiddleware();
app.use("/api", (req, res, next) => {
  const safePath = String(req.path || "");
  if (safePath.startsWith("/server/") || safePath.startsWith("/internal/")) return next();
  return clerkApiMiddleware(req, res, next);
});

app.get("/api/me", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.json({ isAdmin: false, isStaff: false, staffRole: "" });
    }
    if (userAchievementsCollection) {
      await unlockAchievement(auth.userId, "welcome_login", { notify: true }).catch(() => {});
    }
    const user = await clerkClient.users.getUser(auth.userId);
    const staffRole = resolveStaffRoleForUser(user);
    return res.json({
      isAdmin: isAdminUser(user),
      isStaff: Boolean(staffRole),
      staffRole,
    });
  } catch (error) {
    console.error("Failed to load user role", error);
    return res.status(500).json({ error: "Failed to load user role" });
  }
});

app.get("/api/admin/users", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const actingUser = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(actingUser)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const query = normalizeText(req.query?.query, 80);
    const limitRaw = Number(req.query?.limit);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 50) : 20;
    const listParams = { limit };
    if (query) listParams.query = query;
    const result = await clerkClient.users.getUserList(listParams);
    const users = Array.isArray(result?.data) ? result.data : [];
    const userIds = users.map((entry) => String(entry?.id || "")).filter(Boolean);
    const linkedRows = userIds.length
      ? await linkedAccountsCollection
          .find({ webUserId: { $in: userIds } }, { projection: { webUserId: 1 } })
          .toArray()
      : [];
    const linkedSet = new Set(linkedRows.map((row) => String(row.webUserId || "")));
    const entries = users.map((entry) => {
      const linked = linkedSet.has(String(entry?.id || ""));
      const ownedRank = applyLinkedOwnedRankFloor(entry?.publicMetadata?.rank, linked);
      const staffRole = resolveStaffRoleForUser(entry);
      return {
        userId: String(entry?.id || ""),
        username: formatUsernameForDisplay(entry?.username, 80),
        name: getUserDisplayName(entry),
        email: normalizeText(getUserEmail(entry), 120),
        image: String(entry?.imageUrl || ""),
        ownedRank,
        linked,
        staffRole,
        isStaff: Boolean(staffRole),
        isAdmin: isAdminUser(entry),
      };
    });
    return res.json({ users: entries });
  } catch (error) {
    console.error("Failed to list admin users", error);
    return res.status(500).json({ error: "Failed to list users" });
  }
});

app.post("/api/admin/users/:userId/role", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const actingUser = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(actingUser)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const targetUserId = normalizeText(req.params.userId, 128);
    if (!targetUserId) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const requestedRole = normalizeStaffRole(req.body?.staffRole);
    const targetUser = await clerkClient.users.getUser(targetUserId);
    const nextPublicMetadata = { ...(targetUser?.publicMetadata || {}) };
    if (requestedRole) {
      nextPublicMetadata.staffRole = requestedRole;
      if (typeof nextPublicMetadata.showStaffBadge === "undefined") nextPublicMetadata.showStaffBadge = true;
      if (typeof nextPublicMetadata.showStaffBadgeIcon === "undefined") nextPublicMetadata.showStaffBadgeIcon = true;
      if (typeof nextPublicMetadata.showStaffGradient === "undefined") nextPublicMetadata.showStaffGradient = true;
    } else {
      delete nextPublicMetadata.staffRole;
    }
    await clerkClient.users.updateUserMetadata(targetUserId, {
      publicMetadata: nextPublicMetadata,
    });

    const refreshedUser = await clerkClient.users.getUser(targetUserId);
    const staffRole = resolveStaffRoleForUser(refreshedUser);
    const isStaff = Boolean(staffRole);
    const linkedAccount = await isLinkedUserId(targetUserId);
    const rankInfo = resolveDisplayRankFromMetadata(
      refreshedUser?.publicMetadata || {},
      isStaff,
      linkedAccount,
    );
    const showStaffBadge = resolveStaffBadgeVisible(refreshedUser?.publicMetadata || {});
    const showStaffBadgeIcon = resolveStaffBadgeIconVisible(refreshedUser?.publicMetadata || {});
    const showStaffGradient = resolveStaffGradientVisible(refreshedUser?.publicMetadata || {});
    const showRankEffects = resolveRankEffectsVisible(refreshedUser?.publicMetadata || {});
    const showAvatarVfx = resolveAvatarVfxVisible(refreshedUser?.publicMetadata || {});
    const useRankFont = resolveRankFontVisible(refreshedUser?.publicMetadata || {});
    const showDonorGradient = resolveDonorGradientVisible(refreshedUser?.publicMetadata || {});

    await commentsCollection.updateMany(
      { userId: targetUserId, isDeleted: false },
      {
        $set: {
          authorIsStaff: isStaff,
          authorStaffRole: staffRole,
          authorRank: rankInfo.displayRank,
          authorOwnedRank: rankInfo.ownedRank,
          authorShowStaffBadge: showStaffBadge,
          authorShowStaffBadgeIcon: showStaffBadgeIcon,
          authorShowStaffGradient: showStaffGradient,
          authorShowRankEffects: showRankEffects,
          authorShowAvatarVfx: showAvatarVfx,
          authorUseRankFont: useRankFont,
          authorShowDonorGradient: showDonorGradient,
          updatedAt: new Date(),
        },
      },
    );
    await forumPostsCollection.updateMany(
      { authorUserId: targetUserId, isDeleted: false },
      {
        $set: {
          authorIsStaff: isStaff,
          authorStaffRole: staffRole,
          authorRank: rankInfo.displayRank,
          authorOwnedRank: rankInfo.ownedRank,
          authorShowStaffBadge: showStaffBadge,
          authorShowStaffBadgeIcon: showStaffBadgeIcon,
          authorShowStaffGradient: showStaffGradient,
          authorUseRankFont: useRankFont,
          authorShowDonorGradient: showDonorGradient,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    const linked = await linkedAccountsCollection.findOne(
      { webUserId: targetUserId },
      { projection: { _id: 1 } },
    );
    return res.json({
      user: {
        userId: targetUserId,
        username: formatUsernameForDisplay(refreshedUser?.username, 80),
        name: getUserDisplayName(refreshedUser),
        email: normalizeText(getUserEmail(refreshedUser), 120),
        image: String(refreshedUser?.imageUrl || ""),
        ownedRank: rankInfo.ownedRank,
        linked: Boolean(linked),
        staffRole,
        isStaff,
        isAdmin: isAdminUser(refreshedUser),
      },
    });
  } catch (error) {
    console.error("Failed to update admin user role", error);
    return res.status(500).json({ error: "Failed to update user role" });
  }
});

app.get("/api/profile/achievements/:userId", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const userId = normalizeText(req.params.userId, 128);
    if (!userId) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const achievements = await getUserAchievements(userId);
    return res.json({ userId, achievements });
  } catch (error) {
    console.error("Failed to load profile achievements", error);
    return res.status(500).json({ error: "Failed to load profile achievements" });
  }
});

app.get("/api/profile/groups/:userId", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const userId = normalizeText(req.params.userId, 128);
    if (!userId) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const user = await clerkClient.users.getUser(userId);
    const linked = await isLinkedUserId(userId);
    const groups = buildProfileGroupsForUser(user, { linked });
    return res.json({ userId, groups });
  } catch (error) {
    console.error("Failed to load profile groups", error);
    return res.status(500).json({ error: "Failed to load profile groups" });
  }
});

app.get("/api/profile/title", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    const linked = await isLinkedUserId(auth.userId);
    const staffRoleBase = resolveStaffRoleBaseForUser(user);
    const staffRole = resolveStaffRoleForUser(user);
    const isStaff = Boolean(staffRoleBase);
    const staffRolePreviewOptions = getAllowedStaffRolePreviewOptions(staffRoleBase);
    const staffRolePreview = normalizeStaffRole(user?.publicMetadata?.staffRolePreview);
    const { ownedRank, displayRank, availableTitles } = resolveDisplayRankFromMetadata(
      user?.publicMetadata || {},
      isStaff,
      linked,
    );
    return res.json({
      ownedRank,
      selectedTitle: displayRank,
      availableTitles,
      canToggleOwnedBadges: getOwnedDonorBadgeOptions(ownedRank).length > 1,
      showAllOwnedRankBadges: resolveShowAllOwnedRankBadgesVisible(user?.publicMetadata || {}),
      selectedOwnedBadge: resolveSelectedOwnedBadge(user?.publicMetadata || {}, ownedRank),
      ownedBadgeOptions: getOwnedDonorBadgeOptions(ownedRank),
      staffRole,
      staffRoleBase,
      canPreviewStaffRole: staffRolePreviewOptions.length > 0,
      staffRolePreviewOptions,
      staffRolePreview: staffRolePreview && staffRolePreviewOptions.includes(staffRolePreview)
        ? staffRolePreview
        : staffRole,
      achievements: await getUserAchievements(auth.userId),
      canToggleStaffBadge: isStaff,
      showStaffBadge: resolveStaffBadgeVisible(user?.publicMetadata || {}),
      showStaffBadgeIcon: resolveStaffBadgeIconVisible(user?.publicMetadata || {}),
      canToggleStaffGradient: isStaff,
      showStaffGradient: resolveStaffGradientVisible(user?.publicMetadata || {}),
      canToggleRankEffects: isStaff || ownedRank !== "Unregistered",
      showRankEffects: resolveRankEffectsVisible(user?.publicMetadata || {}),
      canToggleRankFont: isStaff || ownedRank !== "Unregistered",
      useRankFont: resolveRankFontVisible(user?.publicMetadata || {}),
      canToggleDonorGradient: hasDonorOwnedRank(ownedRank),
      showDonorGradient: resolveDonorGradientVisible(user?.publicMetadata || {}),
      canToggleAvatarVfx: isStaff || ownedRank !== "Unregistered",
      showAvatarVfx: resolveAvatarVfxVisible(user?.publicMetadata || {}),
    });
  } catch (error) {
    console.error("Failed to load profile title settings", error);
    return res.status(500).json({ error: "Failed to load profile title settings" });
  }
});

app.post("/api/profile/owned-badges", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    const isStaff = isStaffUser(user);
    const linked = await isLinkedUserId(auth.userId);
    const rankInfo = resolveDisplayRankFromMetadata(user?.publicMetadata || {}, isStaff, linked);
    const ownedRank = rankInfo.ownedRank;
    const options = getOwnedDonorBadgeOptions(ownedRank);
    if (options.length === 0) {
      return res.status(400).json({ error: "Owned badge settings unavailable for this rank" });
    }
    const showAllOwnedRankBadges = req.body?.showAllOwnedRankBadges !== false;
    const selectedRequested = normalizeOwnedRank(req.body?.selectedOwnedBadge);
    const selectedOwnedBadge = options.includes(selectedRequested)
      ? selectedRequested
      : options[options.length - 1];

    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        showAllOwnedRankBadges,
        selectedOwnedBadge,
      },
    });

    return res.json({
      canToggleOwnedBadges: options.length > 1,
      showAllOwnedRankBadges,
      selectedOwnedBadge,
      ownedBadgeOptions: options,
    });
  } catch (error) {
    console.error("Failed to update owned badge settings", error);
    return res.status(500).json({ error: "Failed to update owned badge settings" });
  }
});

app.post("/api/profile/staff-badge", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    if (!isStaffUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const showStaffBadge = req.body?.showStaffBadge !== false;
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        showStaffBadge,
      },
    });
    await commentsCollection.updateMany(
      { userId: auth.userId, isDeleted: false },
      { $set: { authorShowStaffBadge: showStaffBadge, updatedAt: new Date() } },
    );
    await forumPostsCollection.updateMany(
      { authorUserId: auth.userId, isDeleted: false },
      { $set: { authorShowStaffBadge: showStaffBadge, updatedAt: new Date().toISOString() } },
    );
    return res.json({ showStaffBadge });
  } catch (error) {
    console.error("Failed to update staff badge settings", error);
    return res.status(500).json({ error: "Failed to update staff badge settings" });
  }
});

app.post("/api/profile/staff-gradient", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    if (!isStaffUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const showStaffGradient = req.body?.showStaffGradient !== false;
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        showStaffGradient,
      },
    });
    await commentsCollection.updateMany(
      { userId: auth.userId, isDeleted: false },
      {
        $set: {
          authorShowStaffGradient: showStaffGradient,
          updatedAt: new Date(),
        },
      },
    );
    await forumPostsCollection.updateMany(
      { authorUserId: auth.userId, isDeleted: false },
      {
        $set: {
          authorShowStaffGradient: showStaffGradient,
          updatedAt: new Date().toISOString(),
        },
      },
    );
    return res.json({ showStaffGradient });
  } catch (error) {
    console.error("Failed to update staff gradient settings", error);
    return res.status(500).json({ error: "Failed to update staff gradient settings" });
  }
});

app.post("/api/profile/staff-badge-icon", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    if (!isStaffUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const showStaffBadgeIcon = req.body?.showStaffBadgeIcon !== false;
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        showStaffBadgeIcon,
      },
    });
    await commentsCollection.updateMany(
      { userId: auth.userId, isDeleted: false },
      {
        $set: {
          authorShowStaffBadgeIcon: showStaffBadgeIcon,
          updatedAt: new Date(),
        },
      },
    );
    await forumPostsCollection.updateMany(
      { authorUserId: auth.userId, isDeleted: false },
      {
        $set: {
          authorShowStaffBadgeIcon: showStaffBadgeIcon,
          updatedAt: new Date().toISOString(),
        },
      },
    );
    return res.json({ showStaffBadgeIcon });
  } catch (error) {
    console.error("Failed to update staff badge icon settings", error);
    return res.status(500).json({ error: "Failed to update staff badge icon settings" });
  }
});

app.post("/api/profile/rank-effects", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    const isStaff = isStaffUser(user);
    const linked = await isLinkedUserId(auth.userId);
    const rankInfo = resolveDisplayRankFromMetadata(user?.publicMetadata || {}, isStaff, linked);
    if (!isStaff && rankInfo.ownedRank === "Unregistered") {
      return res.status(400).json({ error: "Rank effects unavailable for Unregistered" });
    }
    const showRankEffects = req.body?.showRankEffects !== false;
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        showRankEffects,
      },
    });
    await commentsCollection.updateMany(
      { userId: auth.userId, isDeleted: false },
      { $set: { authorShowRankEffects: showRankEffects, updatedAt: new Date() } },
    );
    return res.json({ showRankEffects });
  } catch (error) {
    console.error("Failed to update rank effects settings", error);
    return res.status(500).json({ error: "Failed to update rank effects settings" });
  }
});

app.post("/api/profile/rank-font", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    const isStaff = isStaffUser(user);
    const linked = await isLinkedUserId(auth.userId);
    const rankInfo = resolveDisplayRankFromMetadata(user?.publicMetadata || {}, isStaff, linked);
    if (!isStaff && rankInfo.ownedRank === "Unregistered") {
      return res.status(400).json({ error: "Rank font unavailable for Unregistered" });
    }
    const useRankFont = req.body?.useRankFont === true;
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        useRankFont,
      },
    });
    await commentsCollection.updateMany(
      { userId: auth.userId, isDeleted: false },
      { $set: { authorUseRankFont: useRankFont, updatedAt: new Date() } },
    );
    await forumPostsCollection.updateMany(
      { authorUserId: auth.userId, isDeleted: false },
      { $set: { authorUseRankFont: useRankFont, updatedAt: new Date().toISOString() } },
    );
    return res.json({ useRankFont });
  } catch (error) {
    console.error("Failed to update rank font settings", error);
    return res.status(500).json({ error: "Failed to update rank font settings" });
  }
});

app.post("/api/profile/donor-gradient", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    const isStaff = isStaffUser(user);
    const linked = await isLinkedUserId(auth.userId);
    const rankInfo = resolveDisplayRankFromMetadata(user?.publicMetadata || {}, isStaff, linked);
    if (!hasDonorOwnedRank(rankInfo.ownedRank)) {
      return res.status(400).json({ error: "Donor gradient unavailable for this rank" });
    }
    const showDonorGradient = req.body?.showDonorGradient !== false;
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        showDonorGradient,
      },
    });
    await commentsCollection.updateMany(
      { userId: auth.userId, isDeleted: false },
      { $set: { authorShowDonorGradient: showDonorGradient, updatedAt: new Date() } },
    );
    await forumPostsCollection.updateMany(
      { authorUserId: auth.userId, isDeleted: false },
      { $set: { authorShowDonorGradient: showDonorGradient, updatedAt: new Date().toISOString() } },
    );
    return res.json({ showDonorGradient });
  } catch (error) {
    console.error("Failed to update donor gradient settings", error);
    return res.status(500).json({ error: "Failed to update donor gradient settings" });
  }
});

app.post("/api/profile/avatar-vfx", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    const isStaff = isStaffUser(user);
    const linked = await isLinkedUserId(auth.userId);
    const rankInfo = resolveDisplayRankFromMetadata(user?.publicMetadata || {}, isStaff, linked);
    if (!isStaff && rankInfo.ownedRank === "Unregistered") {
      return res.status(400).json({ error: "Avatar VFX unavailable for Unregistered" });
    }
    const showAvatarVfx = req.body?.showAvatarVfx !== false;
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        showAvatarVfx,
      },
    });
    await commentsCollection.updateMany(
      { userId: auth.userId, isDeleted: false },
      { $set: { authorShowAvatarVfx: showAvatarVfx, updatedAt: new Date() } },
    );
    return res.json({ showAvatarVfx });
  } catch (error) {
    console.error("Failed to update avatar VFX settings", error);
    return res.status(500).json({ error: "Failed to update avatar VFX settings" });
  }
});

app.post("/api/profile/title", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;

    const requestedTitle = normalizeDisplayTitle(req.body?.title);
    if (!requestedTitle) {
      return res.status(400).json({ error: "Invalid title" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const linked = await isLinkedUserId(auth.userId);
    const rankInfo = resolveDisplayRankFromMetadata(
      user?.publicMetadata || {},
      isStaffUser(user),
      linked,
    );
    if (!rankInfo.availableTitles.includes(requestedTitle)) {
      return res.status(400).json({ error: "Title not unlocked" });
    }

    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        displayRank: requestedTitle,
      },
    });

    await commentsCollection.updateMany(
      { userId: auth.userId, isDeleted: false },
      { $set: { authorRank: requestedTitle, updatedAt: new Date() } },
    );

    return res.json({
      ownedRank: rankInfo.ownedRank,
      selectedTitle: requestedTitle,
      availableTitles: rankInfo.availableTitles,
    });
  } catch (error) {
    console.error("Failed to update profile title settings", error);
    return res.status(500).json({ error: "Failed to update profile title settings" });
  }
});

app.get("/api/news", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const rawNews = await newsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    const news = await refreshNewsAuthorFields(rawNews);
    return res.json({ news: stripMongoIdList(news) });
  } catch (error) {
    console.error("Failed to load news", error);
    return res.status(500).json({ error: "Failed to load news" });
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    const { userId, query } = await resolveNotificationQueryForUser(auth?.userId);

    const notifications = await notificationsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ notifications: await withNotificationReadState(notifications, userId) });
  } catch (error) {
    console.error("Failed to load notifications", error);
    return res.status(500).json({ error: "Failed to load notifications" });
  }
});

app.post("/api/notifications/read", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    const userId = normalizeText(auth?.userId, 128);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { query } = await resolveNotificationQueryForUser(userId);
    const requestIds = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => normalizeText(id, 128)).filter(Boolean)
      : [];
    const visibilityFilter = requestIds.length > 0
      ? { ...query, id: { $in: requestIds } }
      : query;
    const visible = await notificationsCollection
      .find(visibilityFilter)
      .project({ id: 1 })
      .toArray();
    const visibleIds = visible.map((entry) => normalizeText(entry.id, 128)).filter(Boolean);
    if (visibleIds.length === 0) {
      return res.json({ marked: 0 });
    }
    const now = new Date().toISOString();
    await notificationReadsCollection.bulkWrite(
      visibleIds.map((notificationId) => ({
        updateOne: {
          filter: { userId, notificationId },
          update: {
            $set: { readAt: now, updatedAt: now },
            $setOnInsert: { id: crypto.randomUUID(), userId, notificationId, createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
    return res.json({ marked: visibleIds.length });
  } catch (error) {
    console.error("Failed to mark notifications as read", error);
    return res.status(500).json({ error: "Failed to mark notifications as read" });
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
        const targetUser = await clerkClient.users.getUser(userId);
        const currentMetadata = targetUser?.publicMetadata || {};
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...currentMetadata,
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
    const rawComments = await commentsCollection
      .find({ newsId, isDeleted: false })
      .sort({ createdAt: 1 })
      .toArray();
    const comments = await refreshCommentAuthorFields(rawComments);
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
    if (await isNewsThreadLocked(newsId)) {
      return res.status(403).json({ error: "Comments are locked for this post" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const email = getUserEmail(user);
    const staffRole = resolveStaffRoleForUser(user);
    const showStaffBadge = resolveStaffBadgeVisible(user?.publicMetadata || {});
    const showStaffBadgeIcon = resolveStaffBadgeIconVisible(user?.publicMetadata || {});
    const showStaffGradient = resolveStaffGradientVisible(user?.publicMetadata || {});
    const useRankFont = resolveRankFontVisible(user?.publicMetadata || {});
    const showDonorGradient = resolveDonorGradientVisible(user?.publicMetadata || {});
    const authorIsStaff = Boolean(staffRole);
    const showRankEffects = resolveRankEffectsVisible(user?.publicMetadata || {});
    const showAvatarVfx = resolveAvatarVfxVisible(user?.publicMetadata || {});
    const linked = await isLinkedUserId(auth.userId);
    const rankInfo = resolveDisplayRankFromMetadata(
      user?.publicMetadata || {},
      authorIsStaff,
      linked,
    );
    const rank = rankInfo.displayRank;
    const authorUsername = formatUsernameForDisplay(user?.username, 80);
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
      authorOwnedRank: rankInfo.ownedRank,
      authorShowStaffBadge: showStaffBadge,
      authorShowStaffBadgeIcon: showStaffBadgeIcon,
      authorShowStaffGradient: showStaffGradient,
      authorStaffRole: staffRole,
      authorShowRankEffects: showRankEffects,
      authorShowAvatarVfx: showAvatarVfx,
      authorUseRankFont: useRankFont,
      authorShowDonorGradient: showDonorGradient,
      replies: [],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const rawComments = await commentsCollection
      .find({ newsId, isDeleted: false })
      .sort({ createdAt: 1 })
      .toArray();
    const comments = await refreshCommentAuthorFields(rawComments);

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
    const repliedToReplyId = normalizeText(req.body?.repliedToReplyId, 128);
    if (!body) {
      return res.status(400).json({ error: "Invalid reply" });
    }
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid comment id" });
    }

    const comment = await commentsCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (await isNewsThreadLocked(comment.newsId)) {
      return res.status(403).json({ error: "Comments are locked for this post" });
    }

    const replies = Array.isArray(comment.replies) ? comment.replies : [];
    const targetReply =
      repliedToReplyId ? replies.find((entry) => String(entry?.id || "") === repliedToReplyId) : null;
    const targetCommentId = String(comment._id);
    const effectiveRepliedToCommentId = targetCommentId;
    const effectiveRepliedToReplyId = targetReply ? String(targetReply.id || "") : "";
    const repliedToAuthorName = normalizeText(
      targetReply?.authorName || comment.authorName,
      80,
    );
    const repliedToSnippet = normalizeText(targetReply?.body || comment.body, 120);
    const repliedToUserId = normalizeText(targetReply?.userId || comment.userId, 128);

    const user = await clerkClient.users.getUser(auth.userId);
    const email = getUserEmail(user);
    const staffRole = resolveStaffRoleForUser(user);
    const authorIsStaff = Boolean(staffRole);
    const showStaffBadge = resolveStaffBadgeVisible(user?.publicMetadata || {});
    const showStaffBadgeIcon = resolveStaffBadgeIconVisible(user?.publicMetadata || {});
    const showStaffGradient = resolveStaffGradientVisible(user?.publicMetadata || {});
    const showRankEffects = resolveRankEffectsVisible(user?.publicMetadata || {});
    const showAvatarVfx = resolveAvatarVfxVisible(user?.publicMetadata || {});
    const useRankFont = resolveRankFontVisible(user?.publicMetadata || {});
    const showDonorGradient = resolveDonorGradientVisible(user?.publicMetadata || {});
    const linked = await isLinkedUserId(auth.userId);
    const rankInfo = resolveDisplayRankFromMetadata(
      user?.publicMetadata || {},
      authorIsStaff,
      linked,
    );
    const rank = rankInfo.displayRank;
    const authorUsername = formatUsernameForDisplay(user?.username, 80);
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
      authorOwnedRank: rankInfo.ownedRank,
      authorIsStaff,
      authorStaffRole: staffRole,
      authorShowStaffBadge: showStaffBadge,
      authorShowStaffBadgeIcon: showStaffBadgeIcon,
      authorShowStaffGradient: showStaffGradient,
      authorShowRankEffects: showRankEffects,
      authorShowAvatarVfx: showAvatarVfx,
      authorUseRankFont: useRankFont,
      authorShowDonorGradient: showDonorGradient,
      repliedToReplyId: effectiveRepliedToReplyId,
      repliedToCommentId: effectiveRepliedToCommentId,
      repliedToName: repliedToAuthorName,
      repliedToAuthorName,
      repliedToSnippet,
      repliedToUserId,
    };

    const updatedReplies = [...(comment.replies || []), reply].slice(-50);
    await commentsCollection.updateOne(
      { _id: comment._id },
      { $set: { replies: updatedReplies, updatedAt: new Date() } },
    );

    if (repliedToUserId && repliedToUserId !== auth.userId) {
      let newsTitle = "";
      if (newsCollection && comment.newsId) {
        try {
          const newsDoc = await newsCollection.findOne(
            { id: String(comment.newsId), isDeleted: false },
            { projection: { title: 1 } },
          );
          newsTitle = normalizeText(newsDoc?.title, 120);
        } catch {
          newsTitle = "";
        }
      }

      const authorLabel =
        formatUsernameForDisplay(user?.username, 80) || getUserDisplayName(user);
      const snippet = normalizeText(body, 140);
      const targetCommentId = String(comment._id);
      const replyLink = `/news?newsId=${encodeURIComponent(String(comment.newsId || ""))}&commentId=${encodeURIComponent(targetCommentId)}&replyId=${encodeURIComponent(String(reply.id || ""))}`;
      await notificationsCollection.insertOne({
        id: crypto.randomUUID(),
        title: newsTitle ? `New reply on ${newsTitle}` : "Someone replied to you",
        message: `${authorLabel} replied: ${snippet}`,
        author: authorLabel,
        authorName: authorLabel,
        authorUserId: auth.userId,
        authorUsername,
        authorImage: user?.imageUrl || "",
        authorRank: rank,
        authorOwnedRank: rankInfo.ownedRank,
        authorIsStaff,
        authorStaffRole: staffRole,
        authorShowStaffBadge: showStaffBadge,
        authorShowStaffBadgeIcon: showStaffBadgeIcon,
        authorShowStaffGradient: showStaffGradient,
        authorShowRankEffects: showRankEffects,
        authorShowAvatarVfx: showAvatarVfx,
        authorUseRankFont: useRankFont,
        authorShowDonorGradient: showDonorGradient,
        featured: false,
        type: "reply",
        targetUserId: repliedToUserId,
        newsId: String(comment.newsId || ""),
        commentId: String(effectiveRepliedToCommentId || targetCommentId),
        replyId: String(reply.id || ""),
        readMoreUrl: replyLink,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await pruneCollection(notificationsCollection, 120);
    }

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

    const normalizedAuthor = getUserDisplayName(user);
    const newsAuthorTracking =
      String(item.author || "").toLowerCase() === "system"
        ? {}
        : {
            author: normalizedAuthor,
            authorUserId: auth.userId,
            authorUsername: formatUsernameForDisplay(user?.username, 80),
            authorImage: user?.imageUrl || "",
          };

    await newsCollection.insertOne({
      ...item,
      ...newsAuthorTracking,
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

    const nextNewsRaw = await newsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    const nextNews = await refreshNewsAuthorFields(nextNewsRaw);
    return res.json({ news: stripMongoIdList(nextNews), createdId: item.id });
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

    const nextNewsRaw = await newsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    const nextNews = await refreshNewsAuthorFields(nextNewsRaw);
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

    const setPayload = {
      updatedAt: new Date().toISOString(),
    };
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "featured")) {
      setPayload.featured = Boolean(req.body?.featured);
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "commentsLocked")) {
      setPayload.commentsLocked = Boolean(req.body?.commentsLocked);
    }

    await newsCollection.updateOne(
      { id: req.params.id, isDeleted: false },
      { $set: setPayload },
    );
    const nextNewsRaw = await newsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    const nextNews = await refreshNewsAuthorFields(nextNewsRaw);
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
    return res.json({
      notifications: await withNotificationReadState(nextNotifications, auth.userId),
    });
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
    return res.json({
      notifications: await withNotificationReadState(nextNotifications, auth.userId),
    });
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
    await notificationReadsCollection.deleteMany({ notificationId: req.params.id });

    const nextNotifications = await notificationsCollection
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({
      notifications: await withNotificationReadState(nextNotifications, auth.userId),
    });
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
    const items = normalizeCartItems(cart?.items || []);
    const linked = await isLinkedUserId(auth.userId);
    const user = await clerkClient.users.getUser(auth.userId);
    const ownedRank = applyLinkedOwnedRankFloor(user?.publicMetadata?.rank, linked);
    const pricing = calculateCartPricing(items, ownedRank);
    return res.json({ items, pricing });
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
    const linked = await getEffectiveLinkedAccountForUserId(auth.userId);
    if (!linked) {
      return res.status(403).json({ error: "Link your game account before using the store" });
    }

    const items = normalizeCartItems(req.body?.items);
    const user = await clerkClient.users.getUser(auth.userId);
    const ownedRank = applyLinkedOwnedRankFloor(user?.publicMetadata?.rank, true);
    const pricing = calculateCartPricing(items, ownedRank);
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
    return res.json({ items, pricing });
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
    const result = await processCartCheckout(auth.userId, {
      purchaseProvider: "LOCAL",
      paymentStatus: "PAID",
    });

    return res.json({
      success: true,
      cart: { items: result.cartItems },
      pricing: result.pricing,
      purchaseId: result.purchaseId,
      awardedRank: result.awardedRank,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({ error: error.message || "Checkout failed" });
    }
    console.error("Failed to checkout cart", error);
    return res.status(500).json({ error: "Failed to checkout cart" });
  }
});

app.post("/api/payments/stripe/create-checkout-session", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!stripeClient || !STRIPE_ENABLED) {
      return res.status(503).json({ error: "Stripe checkout is not configured" });
    }

    const linked = await getEffectiveLinkedAccountForUserId(auth.userId);
    if (!linked) {
      return res.status(403).json({ error: "Link your game account before checkout" });
    }

    const cart = await cartsCollection.findOne({ userId: auth.userId });
    const items = normalizeCartItems(cart?.items || []);
    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const ownedRank = applyLinkedOwnedRankFloor(user?.publicMetadata?.rank, true);
    const pricing = calculateCartPricing(items, ownedRank);
    const pricingById = new Map((pricing.lines || []).map((entry) => [entry.id, entry]));

    const lineItems = items
      .map((entry) => STORE_RANK_PRODUCTS[entry?.id])
      .filter(Boolean)
      .map((product) => {
        const pricingLine = pricingById.get(product.id);
        return ({
        quantity: 1,
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: toStripeUnitAmount(pricingLine?.total ?? product.price),
          product_data: {
            name: product.name,
            metadata: {
              storeItemId: product.id,
              rank: product.rank,
            },
          },
        },
      })});

    if (lineItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const baseUrl = resolveRequestBaseUrl(req);
    if (!baseUrl) {
      return res.status(500).json({ error: "Unable to resolve checkout base URL" });
    }

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      client_reference_id: auth.userId,
      success_url: `${baseUrl}/store/ranks?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/store/ranks?stripe=cancel`,
      metadata: {
        userId: auth.userId,
        cartItemIds: items.map((entry) => entry.id).join(","),
      },
    });

    return res.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url || "",
    });
  } catch (error) {
    console.error("Failed to create Stripe checkout session", error);
    return res.status(500).json({ error: "Failed to start Stripe checkout" });
  }
});

app.post("/api/payments/stripe/create-payment-intent", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!stripeClient || !STRIPE_ENABLED) {
      return res.status(503).json({ error: "Stripe payment is not configured" });
    }
    if (!STRIPE_PUBLISHABLE_KEY) {
      return res.status(503).json({ error: "Stripe publishable key is not configured" });
    }

    const linked = await getEffectiveLinkedAccountForUserId(auth.userId);
    if (!linked) {
      return res.status(403).json({ error: "Link your game account before checkout" });
    }

    const cart = await cartsCollection.findOne({ userId: auth.userId });
    const items = normalizeCartItems(cart?.items || []);
    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const ownedRank = applyLinkedOwnedRankFloor(user?.publicMetadata?.rank, true);
    const pricing = calculateCartPricing(items, ownedRank);
    const amount = toStripeUnitAmount(pricing.total);
    if (amount <= 0) {
      return res.status(400).json({ error: "Cart total is invalid" });
    }

    const intent = await stripeClient.paymentIntents.create({
      amount,
      currency: STRIPE_CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: auth.userId,
        cartItemIds: items.map((entry) => entry.id).join(","),
      },
    });

    return res.json({
      success: true,
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      clientSecret: intent.client_secret || "",
      paymentIntentId: intent.id,
      pricing,
    });
  } catch (error) {
    console.error("Failed to create Stripe payment intent", error);
    const stripeCode = String(error?.code || error?.raw?.code || "").trim();
    const stripeType = String(error?.type || error?.raw?.type || "").trim();
    const stripeMessage = String(error?.raw?.message || error?.message || "").trim();
    const detail =
      stripeMessage && stripeMessage.length < 260
        ? stripeMessage
        : "Stripe rejected the payment intent request.";
    return res.status(500).json({
      error: "Failed to start Stripe payment",
      detail,
      code: stripeCode || undefined,
      type: stripeType || undefined,
    });
  }
});

app.post("/api/profile/staff-role-preview", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const user = await clerkClient.users.getUser(auth.userId);
    const baseRole = resolveStaffRoleBaseForUser(user);
    const options = getAllowedStaffRolePreviewOptions(baseRole);
    if (options.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const requestedRole = normalizeStaffRole(req.body?.staffRolePreview);
    if (!requestedRole || !options.includes(requestedRole)) {
      return res.status(400).json({ error: "Invalid staff role preview" });
    }

    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: {
        ...user.publicMetadata,
        staffRolePreview: requestedRole,
      },
    });

    await commentsCollection.updateMany(
      { userId: auth.userId, isDeleted: false },
      { $set: { authorStaffRole: requestedRole, updatedAt: new Date() } },
    );
    await forumPostsCollection.updateMany(
      { authorUserId: auth.userId, isDeleted: false },
      { $set: { authorStaffRole: requestedRole, updatedAt: new Date().toISOString() } },
    );

    return res.json({
      staffRole: requestedRole,
      staffRolePreview: requestedRole,
      staffRolePreviewOptions: options,
    });
  } catch (error) {
    console.error("Failed to update staff role preview", error);
    return res.status(500).json({ error: "Failed to update staff role preview" });
  }
});

app.post("/api/payments/stripe/finalize-intent", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!stripeClient || !STRIPE_ENABLED) {
      return res.status(503).json({ error: "Stripe payment is not configured" });
    }

    const paymentIntentId = normalizeText(req.body?.paymentIntentId, 160);
    if (!paymentIntentId) {
      return res.status(400).json({ error: "paymentIntentId is required" });
    }
    const intent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    if (!intent) {
      return res.status(404).json({ error: "Payment intent not found" });
    }
    const intentUserId = normalizeText(intent?.metadata?.userId, 128);
    if (intentUserId && intentUserId !== auth.userId) {
      return res.status(403).json({ error: "Payment intent does not belong to this user" });
    }
    if (String(intent.status || "").toLowerCase() !== "succeeded") {
      return res.status(400).json({ error: "Payment has not completed yet" });
    }

    const result = await processCartCheckout(auth.userId, {
      purchaseId: intent.id,
      purchaseProvider: "STRIPE",
      paymentStatus: "PAID",
      stripePaymentIntentId: intent.id,
    });
    return res.json({
      success: true,
      cart: { items: result.cartItems },
      pricing: result.pricing,
      purchaseId: result.purchaseId,
      awardedRank: result.awardedRank,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({ error: error.message || "Checkout failed" });
    }
    console.error("Failed to finalize Stripe payment intent", error);
    return res.status(500).json({ error: "Failed to finalize Stripe payment" });
  }
});

app.post("/api/payments/stripe/complete", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!stripeClient || !STRIPE_ENABLED) {
      return res.status(503).json({ error: "Stripe checkout is not configured" });
    }

    const sessionId = normalizeText(req.body?.sessionId, 160);
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    if (!session || session.mode !== "payment") {
      return res.status(400).json({ error: "Invalid checkout session" });
    }
    if (String(session.client_reference_id || "") !== String(auth.userId)) {
      return res.status(403).json({ error: "Checkout session does not belong to this user" });
    }
    if (String(session.payment_status || "").toLowerCase() !== "paid") {
      return res.status(400).json({ error: "Payment has not completed yet" });
    }

    const result = await fulfillStripeCheckoutSession(session, "checkout-complete");
    if (!result?.success) {
      return res.status(400).json({ error: "Unable to fulfill checkout session" });
    }

    return res.json({
      success: true,
      cart: { items: result.cartItems },
      pricing: result.pricing,
      purchaseId: result.purchaseId,
      awardedRank: result.awardedRank,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({ error: error.message || "Checkout failed" });
    }
    console.error("Failed to finalize Stripe checkout", error);
    return res.status(500).json({ error: "Failed to finalize Stripe checkout" });
  }
});

app.get("/api/fulfillment/pending", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireFulfillmentAuth(req, res)) return;

    const serverId = normalizeText(req.query?.server || req.query?.serverId, 80) || "default";
    const limitRaw = Number(req.query?.limit);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 500) : 50;
    const uuids = [
      ...normalizeUuidList(req.query?.uuid),
      ...normalizeUuidList(req.query?.uuids),
      ...normalizeUuidList(req.query?.onlineUuids),
      ...normalizeUuidList(req.query?.online),
    ];
    const filter = {
      status: "PAID",
      fulfilled: { $ne: true },
      fulfillmentState: { $nin: ["APPLIED", "FAILED"] },
    };
    if (uuids.length > 0) {
      filter.uuid = { $in: Array.from(new Set(uuids)) };
    }
    const docs = await purchasesCollection
      .find(filter)
      .sort({ createdAt: 1 })
      .limit(limit)
      .project({
        _id: 0,
        purchaseId: 1,
        id: 1,
        userId: 1,
        uuid: 1,
        grants: 1,
        items: 1,
        status: 1,
        fulfilled: 1,
        createdAt: 1,
      })
      .toArray();
    const purchases = docs.map((doc) => ({
      purchaseId: normalizeText(doc.purchaseId || doc.id, 128),
      uuid: normalizePlayerUuid(doc.uuid),
      grants: Array.isArray(doc.grants) ? doc.grants : [],
      status: normalizeText(doc.status, 20) || "PAID",
      fulfilled: Boolean(doc.fulfilled),
      createdAt: doc.createdAt || new Date().toISOString(),
    }));
    const actions = purchases
      .filter((purchase) => purchase.purchaseId && purchase.uuid)
      .map((purchase) => ({
        id: purchase.purchaseId,
        playerUuid: purchase.uuid,
        type: "PURCHASE_GRANT",
        payload: {
          purchaseId: purchase.purchaseId,
          grants: purchase.grants,
        },
        createdAt: purchase.createdAt,
      }));
    return res.json({ server: serverId, actions, purchases });
  } catch (error) {
    console.error("Failed to load pending fulfillments", error);
    return res.status(500).json({ error: "Failed to load pending fulfillments" });
  }
});

app.post("/api/fulfillment/ack", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireFulfillmentAuth(req, res)) return;

    const purchaseId = normalizeText(req.body?.purchaseId || req.body?.id, 128);
    if (!purchaseId) {
      return res.status(400).json({ error: "id is required" });
    }
    const now = new Date().toISOString();
    const requestedStatus = normalizeText(req.body?.status, 20).toUpperCase();
    let finalStatus = requestedStatus === "FAILED" ? "FAILED" : "APPLIED";
    if (!requestedStatus && req.body?.ok === false) {
      finalStatus = "FAILED";
    }
    const resultPayload = req.body?.result && typeof req.body.result === "object"
      ? req.body.result
      : {
          ok: finalStatus === "APPLIED",
          detail: normalizeText(req.body?.detail || "", 300),
          serverId: normalizeText(req.body?.server || req.body?.serverId || "", 80),
          error: normalizeText(req.body?.error || "", 500),
        };
    const ackFilter = {
      $or: [{ purchaseId }, { id: purchaseId }],
      fulfillmentState: { $nin: ["APPLIED", "FAILED"] },
    };
    const ackUpdate = {
      $set: {
        fulfilled: true,
        fulfillmentState: finalStatus,
        fulfilledAt: now,
        fulfillmentResult: resultPayload,
        updatedAt: now,
      },
    };
    const updated = await purchasesCollection.updateOne(ackFilter, ackUpdate);
    if (updated.modifiedCount > 0) {
      return res.json({
        success: true,
        id: purchaseId,
        purchaseId,
        status: finalStatus,
        alreadyFinal: false,
      });
    }
    const existing = await purchasesCollection.findOne(
      { $or: [{ purchaseId }, { id: purchaseId }] },
      { projection: { _id: 0, fulfilled: 1, fulfillmentState: 1 } },
    );
    if (existing && (existing.fulfilled === true || ["APPLIED", "FAILED"].includes(existing.fulfillmentState))) {
      return res.json({
        success: true,
        id: purchaseId,
        purchaseId,
        status: normalizeText(existing.fulfillmentState, 20) || "APPLIED",
        alreadyFinal: true,
      });
    }
    return res.status(404).json({ error: "Purchase not found" });
  } catch (error) {
    console.error("Failed to acknowledge fulfillment", error);
    return res.status(500).json({ error: "Failed to acknowledge fulfillment" });
  }
});

app.post("/api/link/create", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireServerSecret(req, res, "link_create")) return;

    const playerUuid = normalizePlayerUuid(req.body?.playerUuid || req.body?.uuid);
    if (!playerUuid) {
      return res.status(400).json({ error: "playerUuid is required" });
    }
    const playerName = normalizeText(req.body?.playerName || req.body?.username || "", 60);
    const linked = await linkedAccountsCollection.findOne(
      { playerUuid },
      { projection: { _id: 0, webUserId: 1 } },
    );
    if (linked?.webUserId) {
      return res.status(409).json({
        code: "ALREADY_LINKED",
        error: "Player UUID is already linked",
        accountId: linked.webUserId,
      });
    }

    const created = await createHostedLinkCode({ playerUuid, playerName });
    if (!created.ok) {
      return res.status(created.status || 500).json({
        code: created.code || "SERVER_UNAVAILABLE",
        error: created.error || "Failed to create link code",
      });
    }
    return res.json({
      code: created.code,
      expiresAt: created.expiresAt,
      playerUuid,
      reused: Boolean(created.reused),
    });
  } catch (error) {
    console.error("Failed to create link code", error);
    return res.status(500).json({ error: "Failed to create link code" });
  }
});

app.get("/api/link/info", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const code = normalizeLinkCode(req.query?.code);
    if (code.length !== 8) {
      return res.status(400).json({ valid: false, code: "INVALID_CODE", error: "code is required" });
    }
    const doc = await linkCodesCollection.findOne({ code });
    if (!doc) {
      return res.status(404).json({ valid: false, code: "NOT_FOUND", error: "Code not found" });
    }
    const status = normalizeLinkCodeDocStatus(doc);
    const isExpired = status === "expired";
    return res.json({
      valid: status === "pending" || status === "claimed",
      status,
      isExpired,
      isClaimed: status === "claimed",
      expiresAt: doc.expiresAt instanceof Date ? doc.expiresAt.toISOString() : "",
      playerUuidMasked: maskPlayerUuid(doc.playerUuid),
    });
  } catch (error) {
    console.error("Failed to load link info", error);
    return res.status(500).json({ error: "Failed to load link info" });
  }
});

app.post("/api/link/claim", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const code = normalizeLinkCode(req.body?.code);
    const claimResult = await claimHostedLinkCode({ code, webUserId: auth.userId });
    if (!claimResult.ok) {
      return res.status(claimResult.status || 400).json({
        code: normalizeText(claimResult.code || "INVALID_CODE", 80).toUpperCase(),
        error: claimResult.error || "Failed to claim link code",
      });
    }
    return res.json({
      ok: true,
      claimed: true,
      code: claimResult.code,
      playerUuidMasked: maskPlayerUuid(claimResult.playerUuid),
      expiresAt: claimResult.expiresAt || "",
    });
  } catch (error) {
    console.error("Failed to claim link code", error);
    return res.status(500).json({ error: "Failed to claim link code" });
  }
});

app.post("/api/server/register-code", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireServerSecret(req, res, "register_code")) return;
    const code = normalizeLinkCode(req.body?.code);
    const playerUuid = normalizePlayerUuid(req.body?.playerUuid || req.body?.uuid);
    const playerName = normalizeText(req.body?.playerName || req.body?.username || "", 60);
    const expiresInSecRaw = Number(req.body?.expiresInSec || req.body?.expiresSeconds || LINK_CODE_TTL_SEC);
    const expiresInSec = Number.isFinite(expiresInSecRaw) ? Math.max(30, Math.min(Math.trunc(expiresInSecRaw), 3600)) : LINK_CODE_TTL_SEC;
    const expiresAt = new Date(Date.now() + expiresInSec * 1000);
    const registered = await registerHostedLinkCode({ code, playerUuid, playerName, expiresAt });
    if (!registered.ok) {
      return res.status(registered.status || 400).json({
        code: normalizeText(registered.code || "INVALID_CODE", 80).toUpperCase(),
        error: registered.error || "Failed to register code",
      });
    }
    return res.json({
      ok: true,
      code: registered.code,
      playerUuid: registered.playerUuid,
      expiresAt: registered.expiresAt,
    });
  } catch (error) {
    console.error("Failed to register link code", error);
    return res.status(500).json({ error: "Failed to register link code" });
  }
});

app.get("/api/server/pending-links", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireServerSecret(req, res, "pending_links")) return;
    const limitRaw = Number(req.query?.limit);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200) : 50;
    const now = new Date();
    const links = await linkCodesCollection
      .find({
        status: "claimed",
        claimedByUserId: { $exists: true, $ne: "" },
        expiresAt: { $gt: now },
      })
      .sort({ claimedAt: 1, createdAt: 1 })
      .limit(limit)
      .project({
        _id: 0,
        code: 1,
        playerUuid: 1,
        claimedByUserId: 1,
        claimedAt: 1,
      })
      .toArray();
    return res.json({
      links: links.map((entry) => ({
        code: normalizeLinkCode(entry.code),
        playerUuid: normalizePlayerUuid(entry.playerUuid),
        userId: normalizeText(entry.claimedByUserId || "", 128),
        claimedAt: entry.claimedAt || "",
      })),
    });
  } catch (error) {
    console.error("Failed to load pending links", error);
    return res.status(500).json({ error: "Failed to load pending links" });
  }
});

app.post("/api/server/ack-link", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireServerSecret(req, res, "ack_link")) return;
    const code = normalizeLinkCode(req.body?.code);
    if (code.length !== 8) {
      return res.status(400).json({ error: "code is required" });
    }
    const resultRaw = normalizeText(req.body?.result, 20).toLowerCase();
    const isApplied = resultRaw === "applied";
    const finalStatus = isApplied ? "completed" : "failed";
    const now = new Date();
    const errorText = normalizeText(req.body?.error || "", 500);

    const existing = await linkCodesCollection.findOne({ code });
    if (!existing) {
      return res.status(404).json({ error: "Link code not found" });
    }
    const existingStatus = normalizeLinkCodeDocStatus(existing);
    if (existingStatus === "completed" || existingStatus === "failed") {
      return res.json({ success: true, code, status: existingStatus, alreadyFinal: true });
    }
    if (existingStatus !== "claimed") {
      return res.status(409).json({ error: "Link code is not in claimed state" });
    }
    const playerUuid = normalizePlayerUuid(existing.playerUuid);
    const userId = normalizeText(existing.claimedByUserId || "", 128);
    if (!playerUuid || !userId) {
      return res.status(409).json({ error: "Claimed link code is missing player/user mapping" });
    }

    if (isApplied) {
      const existingByPlayer = await linkedAccountsCollection.findOne({ playerUuid });
      if (existingByPlayer?.webUserId && existingByPlayer.webUserId !== userId) {
        return res.status(409).json({ error: "Player UUID already linked to another user" });
      }
      await linkedAccountsCollection.updateOne(
        { webUserId: userId },
        {
          $set: {
            webUserId: userId,
            playerUuid,
            playerName: normalizeText(existing.playerName || "", 60),
            linkSource: "CODE",
            linkedSource: "CODE",
            linkedAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
          $setOnInsert: {
            createdAt: now.toISOString(),
          },
        },
        { upsert: true },
      );
    }

    await linkCodesCollection.updateOne(
      { code, status: "claimed" },
      {
        $set: {
          status: finalStatus,
          completedAt: now,
          updatedAt: now,
          error: isApplied ? "" : errorText,
        },
      },
    );
    return res.json({ success: true, code, status: finalStatus, alreadyFinal: false });
  } catch (error) {
    console.error("Failed to acknowledge link", error);
    return res.status(500).json({ error: "Failed to acknowledge link" });
  }
});

async function handlePendingGrants(req, res, routeLabel) {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireServerSecret(req, res, routeLabel)) return;
    const serverId = normalizeText(req.query?.serverId || req.query?.server || "prod", 40) || "prod";
    const limitRaw = Number(req.query?.limit);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200) : 50;
    const docs = await grantsCollection
      .find({ status: "PENDING", serverId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .project({ _id: 1, grantId: 1, playerUuid: 1, type: 1, value: 1, payload: 1, createdAt: 1 })
      .toArray();
    const grants = docs.map((doc) => ({
      grantId: normalizeText(doc.grantId || String(doc._id || ""), 160),
      playerUuid: normalizePlayerUuid(doc.playerUuid),
      type: normalizeText(doc.type || "PERK", 30).toUpperCase(),
      value: normalizeText(doc.value || "", 120),
      payload: doc.payload && typeof doc.payload === "object" ? doc.payload : {},
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt || ""),
    }));
    return res.json({
      grants,
      jobs: grants.map((entry) => ({
        jobId: entry.grantId,
        playerUuid: entry.playerUuid,
        payload: {
          type: entry.type,
          value: entry.value,
          ...entry.payload,
        },
      })),
    });
  } catch (error) {
    console.error("Failed to load pending grants", error);
    return res.status(500).json({ error: "Failed to load pending grants" });
  }
}

async function handleAckGrants(req, res, routeLabel) {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireServerSecret(req, res, routeLabel)) return;
    const ackRows = Array.isArray(req.body?.acks) ? req.body.acks : null;
    if (ackRows && ackRows.length > 0) {
      const updates = [];
      for (const row of ackRows) {
        const grantId = normalizeText(row?.grantId || row?.jobId || row?.id, 160);
        if (!grantId) continue;
        const rawStatus = normalizeText(row?.status || row?.result, 20).toUpperCase();
        const nextStatus = rawStatus === "APPLIED" ? "APPLIED" : "FAILED";
        const errorText = normalizeText(row?.message || row?.error || "", 500);
        const now = new Date();
        const updateResult = await grantsCollection.updateOne(
          { grantId, status: "PENDING" },
          {
            $set: {
              status: nextStatus,
              appliedAt: now,
              updatedAt: now,
              error: nextStatus === "FAILED" ? errorText : "",
            },
          },
        );
        updates.push({ grantId, updated: updateResult.modifiedCount > 0, status: nextStatus });
      }
      return res.json({ success: true, updates });
    }

    const grantId = normalizeText(req.body?.grantId || req.body?.jobId || req.body?.id, 160);
    if (!grantId) {
      return res.status(400).json({ error: "grantId is required" });
    }
    const rawStatus = normalizeText(req.body?.status || req.body?.result, 20).toUpperCase();
    const nextStatus = rawStatus === "APPLIED" ? "APPLIED" : "FAILED";
    const now = new Date();
    const errorText = normalizeText(req.body?.message || req.body?.error || "", 500);

    const updated = await grantsCollection.updateOne(
      { grantId, status: "PENDING" },
      {
        $set: {
          status: nextStatus,
          appliedAt: now,
          updatedAt: now,
          error: nextStatus === "FAILED" ? errorText : "",
        },
      },
    );
    if (updated.modifiedCount > 0) {
      return res.json({ success: true, grantId, status: nextStatus, alreadyFinal: false });
    }
    const existing = await grantsCollection.findOne(
      { grantId },
      { projection: { _id: 0, status: 1 } },
    );
    if (existing?.status && existing.status !== "PENDING") {
      return res.json({ success: true, grantId, status: String(existing.status), alreadyFinal: true });
    }
    return res.status(404).json({ error: "Grant not found" });
  } catch (error) {
    console.error("Failed to acknowledge grant", error);
    return res.status(500).json({ error: "Failed to acknowledge grant" });
  }
}

app.get("/api/server/pending-fulfillments", async (req, res) => {
  return handlePendingGrants(req, res, "pending_fulfillments");
});

app.post("/api/server/ack-fulfillment", async (req, res) => {
  return handleAckGrants(req, res, "ack_fulfillment");
});

app.get("/api/internal/fulfillment/pending", async (req, res) => {
  return handlePendingGrants(req, res, "internal_pending_fulfillments");
});

app.post("/api/internal/fulfillment/ack", async (req, res) => {
  return handleAckGrants(req, res, "internal_ack_fulfillment");
});

app.get("/api/internal/debug/link-status", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireServerSecret(req, res, "internal_debug_link_status")) return;
    const code = normalizeLinkCode(req.query?.code);
    if (code.length !== 8) {
      return res.status(400).json({ error: "code is required" });
    }
    const doc = await linkCodesCollection.findOne({ code });
    if (!doc) {
      return res.status(404).json({ error: "Code not found" });
    }
    const status = normalizeLinkCodeDocStatus(doc);
    return res.json({
      code: normalizeLinkCode(doc.code),
      status,
      playerUuid: normalizePlayerUuid(doc.playerUuid),
      playerUuidMasked: maskPlayerUuid(doc.playerUuid),
      playerUsername: normalizeText(doc.playerName || doc.playerUsername || "", 60),
      claimedByUserId: normalizeText(doc.claimedByUserId || "", 128) || null,
      usedByWebUserId: normalizeText(doc.usedByWebUserId || "", 128) || null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt || ""),
      expiresAt: doc.expiresAt instanceof Date ? doc.expiresAt.toISOString() : String(doc.expiresAt || ""),
      usedAt: doc.usedAt instanceof Date ? doc.usedAt.toISOString() : doc.usedAt || null,
    });
  } catch (error) {
    console.error("Failed to load internal link debug status", error);
    return res.status(500).json({ error: "Failed to load internal link debug status" });
  }
});

app.post("/api/internal/link/register", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    if (!requireServerSecret(req, res, "internal_link_register")) return;
    const code = normalizeLinkCode(req.body?.code);
    const playerUuid = normalizePlayerUuid(req.body?.playerUuid);
    const playerUsername = normalizeText(req.body?.playerUsername || req.body?.playerName || "", 60);
    const expiresAtRaw = Number(req.body?.expiresAt);
    const expiresAt = Number.isFinite(expiresAtRaw) ? new Date(expiresAtRaw) : new Date(Date.now() + LINK_CODE_TTL_SEC * 1000);
    const registered = await registerHostedLinkCode({
      code,
      playerUuid,
      playerName: playerUsername,
      expiresAt,
    });
    if (!registered.ok) {
      return res.status(registered.status || 400).json({
        error: normalizeText(registered.code || "INVALID_REQUEST", 80).toLowerCase(),
      });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error("Failed to register internal link code", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

app.get("/api/link/status", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const pluginPlayerUuidRaw = normalizeText(req.query?.playerUuid || req.query?.uuid, 64);
    if (pluginPlayerUuidRaw) {
      if (!requireServerSecret(req, res, "link_status")) return;
      const playerUuid = normalizePlayerUuid(pluginPlayerUuidRaw);
      if (!playerUuid) {
        return res.status(400).json({ error: "playerUuid is invalid" });
      }
      const linked = await linkedAccountsCollection.findOne(
        { playerUuid },
        { projection: { _id: 0, webUserId: 1 } },
      );
      return res.json({
        linked: Boolean(linked?.webUserId),
        accountId: linked?.webUserId || null,
      });
    }
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const doc = await linkedAccountsCollection.findOne({ webUserId: auth.userId });
    if (!doc) {
      const authUser = await clerkClient.users.getUser(auth.userId).catch(() => null);
      const override = resolveTestLinkOverrideForUser(authUser);
      if (override) {
        return res.json({
          linked: true,
          linkingEnabled: LINKING_ENABLED,
          linkMode: LINKING_ENABLED ? "live" : "mock",
          playerUuid: override.playerUuid,
          maskedPlayerUuid: override.maskedPlayerUuid,
          playerName: override.playerName,
          linkedAt: override.linkedAt,
        });
      }
      return res.json({ linked: false, linkingEnabled: LINKING_ENABLED, linkMode: LINKING_ENABLED ? "live" : "mock" });
    }
    return res.json({
      linked: true,
      linkingEnabled: LINKING_ENABLED,
      linkMode: LINKING_ENABLED ? "live" : "mock",
      playerUuid: doc.playerUuid || "",
      maskedPlayerUuid: maskPlayerUuid(doc.playerUuid),
      playerName: normalizeText(doc.playerName || "", 60),
      linkedAt: doc.linkedAt || doc.createdAt || doc.updatedAt || "",
    });
  } catch (error) {
    console.error("Failed to load link status", error);
    return res.status(500).json({ error: "Failed to load link status" });
  }
});

app.get("/api/profile/link-status/:userId", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const userId = normalizeText(req.params.userId, 128);
    if (!userId) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const doc = await linkedAccountsCollection.findOne({ webUserId: userId });
    if (!doc) {
      const targetUser = await clerkClient.users.getUser(userId).catch(() => null);
      const override = resolveTestLinkOverrideForUser(targetUser);
      if (override) {
        return res.json({
          linked: true,
          playerUuid: override.playerUuid,
          playerName: override.playerName,
          linkedAt: override.linkedAt,
        });
      }
      return res.json({ linked: false, playerUuid: "", playerName: "" });
    }
    return res.json({
      linked: true,
      playerUuid: String(doc.playerUuid || ""),
      playerName: normalizeText(doc.playerName || "", 60),
      linkedAt: doc.linkedAt || doc.createdAt || doc.updatedAt || "",
    });
  } catch (error) {
    console.error("Failed to load profile link status", error);
    return res.status(500).json({ error: "Failed to load profile link status" });
  }
});

app.post("/api/link/redeem", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = requireCommentAuth(req, res);
    if (!auth) return;
    const code = normalizeLinkCode(req.body?.code);
    const claimResult = await claimHostedLinkCode({ code, webUserId: auth.userId });
    if (!claimResult.ok) {
      return res.status(claimResult.status || 400).json({
        code: normalizeText(claimResult.code || "INVALID_CODE", 80).toUpperCase(),
        error: claimResult.error || "Failed to claim link code",
      });
    }
    return res.json({
      success: true,
      ok: true,
      claimed: true,
      linked: false,
      code: claimResult.code,
      playerUuidMasked: maskPlayerUuid(claimResult.playerUuid),
      expiresAt: claimResult.expiresAt || "",
      status: "claimed",
    });
  } catch (error) {
    console.error("Failed to redeem link code", error);
    return res.status(500).json({ error: "Failed to redeem link code" });
  }
});

app.get("/api/forum/posts", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const section = normalizeForumSection(req.query.section);
    if (!section) {
      return res.status(400).json({ error: "Invalid forum section" });
    }
    const docsRaw = await forumPostsCollection
      .find({ section, isDeleted: false })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(120)
      .toArray();
    const docs = await refreshForumPostAuthorFields(docsRaw);
    const posts = docs.map(normalizeForumPost).filter(Boolean);
    return res.json({ posts, section });
  } catch (error) {
    console.error("Failed to load forum posts", error);
    return res.status(500).json({ error: "Failed to load forum posts" });
  }
});

app.get("/api/forum/posts/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const postId = normalizeText(req.params.id, 128);
    if (!postId) {
      return res.status(400).json({ error: "Invalid forum post id" });
    }
    const docRaw = await forumPostsCollection.findOne({ id: postId, isDeleted: false });
    if (!docRaw) {
      return res.status(404).json({ error: "Forum post not found" });
    }
    const [refreshed] = await refreshForumPostAuthorFields([docRaw]);
    return res.json({ post: normalizeForumPost(refreshed) });
  } catch (error) {
    console.error("Failed to load forum post", error);
    return res.status(500).json({ error: "Failed to load forum post" });
  }
});

app.get("/api/forum/posts/:id/history", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const postId = normalizeText(req.params.id, 128);
    if (!postId) {
      return res.status(400).json({ error: "Invalid forum post id" });
    }
    const history = await forumPostRevisionsCollection
      .find({ postId })
      .sort({ createdAt: 1 })
      .toArray();
    return res.json({ postId, history: stripMongoIdList(history) });
  } catch (error) {
    console.error("Failed to load forum post history", error);
    return res.status(500).json({ error: "Failed to load forum post history" });
  }
});

app.post("/api/forum/posts", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const section = normalizeForumSection(req.body?.section);
    const title = normalizeForumTitle(req.body?.title);
    const body = normalizeForumBody(req.body?.body);
    const bodyFormat = normalizeForumBodyFormat(req.body?.bodyFormat || "markdown");
    if (!section || !title || !body) {
      return res.status(400).json({ error: "Missing or invalid forum post fields" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const staffRole = resolveStaffRoleForUser(user);
    const linked = await isLinkedUserId(auth.userId);
    const rankInfo = resolveDisplayRankFromMetadata(
      user?.publicMetadata || {},
      Boolean(staffRole),
      linked,
    );
    const authorRank = rankInfo.displayRank;
    const authorIsStaff = Boolean(staffRole);
    const showStaffBadge = resolveStaffBadgeVisible(user?.publicMetadata || {});
    const showStaffBadgeIcon = resolveStaffBadgeIconVisible(user?.publicMetadata || {});
    const showStaffGradient = resolveStaffGradientVisible(user?.publicMetadata || {});
    const useRankFont = resolveRankFontVisible(user?.publicMetadata || {});
    const showDonorGradient = resolveDonorGradientVisible(user?.publicMetadata || {});
    const now = new Date().toISOString();
    const post = {
      id: crypto.randomUUID(),
      section,
      title,
      body,
      bodyFormat,
      createdBy: auth.userId,
      authorName: getUserDisplayName(user),
      authorRank,
      authorOwnedRank: rankInfo.ownedRank,
      authorIsStaff,
      authorStaffRole: staffRole,
      authorUserId: auth.userId,
      authorUsername: formatUsernameForDisplay(user?.username, 80),
      authorImage: user?.imageUrl || "",
      authorShowStaffBadge: showStaffBadge,
      authorShowStaffBadgeIcon: showStaffBadgeIcon,
      authorShowStaffGradient: showStaffGradient,
      authorUseRankFont: useRankFont,
      authorShowDonorGradient: showDonorGradient,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    await forumPostsCollection.insertOne(post);
    const created = await forumPostsCollection.findOne({ id: post.id, isDeleted: false });
    return res.json({ post: normalizeForumPost(created) });
  } catch (error) {
    console.error("Failed to create forum post", error);
    return res.status(500).json({ error: "Failed to create forum post" });
  }
});

app.patch("/api/forum/posts/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const postId = normalizeText(req.params.id, 128);
    if (!postId) {
      return res.status(400).json({ error: "Invalid forum post id" });
    }

    const doc = await forumPostsCollection.findOne({ id: postId, isDeleted: false });
    if (!doc) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const isStaff = isAdminUser(user);
    const actorLinked = await isLinkedUserId(auth.userId);
    const isOwner = String(doc.createdBy || "") === auth.userId;
    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const nextTitle = normalizeForumTitle(req.body?.title);
    const nextBody = normalizeForumBody(req.body?.body);
    const nextBodyFormat = normalizeForumBodyFormat(req.body?.bodyFormat || doc.bodyFormat || "markdown");
    if (!nextTitle || !nextBody) {
      return res.status(400).json({ error: "Missing or invalid forum post fields" });
    }

    const now = new Date().toISOString();
    const forcedEdit = isStaff && !isOwner;
    const editorName = getUserDisplayName(user);
    const previousTitle = String(doc.title || "");
    const previousBody = String(doc.body || "");
    const nextTitleValue = String(nextTitle || "");
    const nextBodyValue = String(nextBody || "");
    if (previousTitle !== nextTitleValue || previousBody !== nextBodyValue) {
      await forumPostRevisionsCollection.insertOne({
        postId,
        editedBy: auth.userId,
        editorName,
        editorImage: user?.imageUrl || "",
        oldTitle: previousTitle,
        oldBody: previousBody,
        newTitle: nextTitleValue,
        newBody: nextBodyValue,
        forcedEdit,
        createdAt: now,
      });
    }
    await forumPostsCollection.updateOne(
      { id: postId, isDeleted: false },
      {
        $set: {
          title: nextTitle,
          body: nextBody,
          bodyFormat: nextBodyFormat,
          updatedAt: now,
          editedAt: now,
          editedByUserId: auth.userId,
          editedByName: editorName,
          staffForcedEdit: forcedEdit,
          staffForcedEditBy: forcedEdit ? editorName : "",
          staffForcedEditAt: forcedEdit ? now : "",
        },
        $inc: { editCount: 1 },
      },
    );

    if (forcedEdit && doc.createdBy && doc.createdBy !== auth.userId) {
      await notificationsCollection.insertOne({
        id: crypto.randomUUID(),
        title: "Forum Post Edited by Staff",
        message: `${editorName} edited your forum post: ${String(doc.title || "Untitled Post")}`,
        author: editorName,
        authorName: editorName,
        authorUserId: auth.userId,
        authorUsername: formatUsernameForDisplay(user?.username, 80),
        authorImage: user?.imageUrl || "",
        authorRank: resolveDisplayRankFromMetadata(
          user?.publicMetadata || {},
          isStaff,
          actorLinked,
        ).displayRank,
        authorStaffRole: resolveStaffRoleForUser(user),
        authorShowStaffBadge: resolveStaffBadgeVisible(user?.publicMetadata || {}),
        authorShowStaffBadgeIcon: resolveStaffBadgeIconVisible(user?.publicMetadata || {}),
        authorShowStaffGradient: resolveStaffGradientVisible(user?.publicMetadata || {}),
        authorUseRankFont: resolveRankFontVisible(user?.publicMetadata || {}),
        authorShowDonorGradient: resolveDonorGradientVisible(user?.publicMetadata || {}),
        featured: false,
        type: "forum_post_staff_edit",
        targetUserId: doc.createdBy,
        readMoreUrl: `/forum?section=${encodeURIComponent(String(doc.section || ""))}&post=${encodeURIComponent(postId)}`,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      });
      await pruneCollection(notificationsCollection, 120);
    }

    const updatedRaw = await forumPostsCollection.findOne({ id: postId, isDeleted: false });
    if (!updatedRaw) {
      return res.status(404).json({ error: "Forum post not found" });
    }
    const [updated] = await refreshForumPostAuthorFields([updatedRaw]);
    return res.json({ post: normalizeForumPost(updated) });
  } catch (error) {
    console.error("Failed to update forum post", error);
    return res.status(500).json({ error: "Failed to update forum post" });
  }
});

app.delete("/api/forum/posts/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const postId = normalizeText(req.params.id, 128);
    if (!postId) {
      return res.status(400).json({ error: "Invalid forum post id" });
    }

    const doc = await forumPostsCollection.findOne({ id: postId, isDeleted: false });
    if (!doc) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    const user = await clerkClient.users.getUser(auth.userId);
    const isStaff = isAdminUser(user);
    const actorLinked = await isLinkedUserId(auth.userId);
    const isOwner = String(doc.createdBy || "") === auth.userId;
    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const now = new Date().toISOString();
    await forumPostsCollection.updateOne(
      { id: postId, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: now,
          deletedBy: auth.userId,
          updatedAt: now,
        },
      },
    );

    if (isStaff && !isOwner && doc.createdBy) {
      const editorName = getUserDisplayName(user);
      await notificationsCollection.insertOne({
        id: crypto.randomUUID(),
        title: "Forum Post Removed by Staff",
        message: `${editorName} removed your forum post: ${String(doc.title || "Untitled Post")}`,
        author: editorName,
        authorName: editorName,
        authorUserId: auth.userId,
        authorUsername: formatUsernameForDisplay(user?.username, 80),
        authorImage: user?.imageUrl || "",
        authorRank: resolveDisplayRankFromMetadata(
          user?.publicMetadata || {},
          isStaff,
          actorLinked,
        ).displayRank,
        authorStaffRole: resolveStaffRoleForUser(user),
        authorShowStaffBadge: resolveStaffBadgeVisible(user?.publicMetadata || {}),
        authorShowStaffBadgeIcon: resolveStaffBadgeIconVisible(user?.publicMetadata || {}),
        authorShowStaffGradient: resolveStaffGradientVisible(user?.publicMetadata || {}),
        authorUseRankFont: resolveRankFontVisible(user?.publicMetadata || {}),
        authorShowDonorGradient: resolveDonorGradientVisible(user?.publicMetadata || {}),
        featured: false,
        type: "forum_post_staff_delete",
        targetUserId: doc.createdBy,
        readMoreUrl: `/forum?section=${encodeURIComponent(String(doc.section || ""))}`,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      });
      await pruneCollection(notificationsCollection, 120);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete forum post", error);
    return res.status(500).json({ error: "Failed to delete forum post" });
  }
});

app.get("/api/forum/tickets", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    await purgeClosedSupportTickets();
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await clerkClient.users.getUser(auth.userId);
    const isAdmin = isAdminUser(user);
    const status = normalizeTicketStatus(req.query.status);
    const filter = { isDeleted: false };
    if (!isAdmin) {
      filter.createdBy = auth.userId;
    }
    if (req.query.status) {
      filter.status = status;
    }
    const docs = await supportTicketsCollection
      .find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();
    const tickets = docs.map(normalizeTicketDoc).filter(Boolean).map(toTicketSummary).filter(Boolean);
    return res.json({ tickets, isAdmin });
  } catch (error) {
    console.error("Failed to load support tickets", error);
    return res.status(500).json({ error: "Failed to load support tickets" });
  }
});

app.post("/api/forum/tickets", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    await purgeClosedSupportTickets();
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const subject = normalizeTicketSubject(req.body?.subject);
    const body = normalizeTicketBody(req.body?.body);
    const category = normalizeTicketCategory(req.body?.category);
    if (!subject || !body) {
      return res.status(400).json({ error: "Missing subject or message" });
    }
    const user = await clerkClient.users.getUser(auth.userId);
    const ticketId = crypto.randomUUID();
    const now = new Date().toISOString();
    const authorName = getUserDisplayName(user);
    const firstMessage = {
      id: crypto.randomUUID(),
      body,
      authorId: auth.userId,
      authorName,
      role: "user",
      createdAt: now,
    };
    await supportTicketsCollection.insertOne({
      id: ticketId,
      subject,
      category,
      status: "open",
      createdBy: auth.userId,
      createdByName: authorName,
      assigneeId: "",
      body,
      messages: [firstMessage],
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });
    const created = await supportTicketsCollection.findOne({ id: ticketId, isDeleted: false });
    return res.json({ ticket: normalizeTicketDoc(created) });
  } catch (error) {
    console.error("Failed to create support ticket", error);
    return res.status(500).json({ error: "Failed to create support ticket" });
  }
});

app.get("/api/forum/tickets/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    await purgeClosedSupportTickets();
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await clerkClient.users.getUser(auth.userId);
    const isAdmin = isAdminUser(user);
    const ticketId = normalizeText(req.params.id, 128);
    if (!ticketId) {
      return res.status(400).json({ error: "Invalid ticket id" });
    }
    const doc = await supportTicketsCollection.findOne({ id: ticketId, isDeleted: false });
    if (!doc) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    if (!isAdmin && doc.createdBy !== auth.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    return res.json({ ticket: normalizeTicketDoc(doc), isAdmin });
  } catch (error) {
    console.error("Failed to load support ticket", error);
    return res.status(500).json({ error: "Failed to load support ticket" });
  }
});

app.post("/api/forum/tickets/:id/messages", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    await purgeClosedSupportTickets();
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const body = normalizeTicketBody(req.body?.body);
    if (!body) {
      return res.status(400).json({ error: "Invalid message" });
    }
    const ticketId = normalizeText(req.params.id, 128);
    const user = await clerkClient.users.getUser(auth.userId);
    const isAdmin = isAdminUser(user);
    const doc = await supportTicketsCollection.findOne({ id: ticketId, isDeleted: false });
    if (!doc) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    if (!isAdmin && doc.createdBy !== auth.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const message = {
      id: crypto.randomUUID(),
      body,
      authorId: auth.userId,
      authorName: getUserDisplayName(user),
      role: isAdmin ? "admin" : "user",
      createdAt: new Date().toISOString(),
    };
    const nextStatus = isAdmin ? "pending" : "open";
    await supportTicketsCollection.updateOne(
      { id: ticketId, isDeleted: false },
      {
        $push: { messages: message },
        $set: {
          status: nextStatus,
          assigneeId: isAdmin ? auth.userId : normalizeText(doc.assigneeId, 128),
          updatedAt: new Date().toISOString(),
        },
      },
    );
    if (isAdmin && doc.createdBy && doc.createdBy !== auth.userId) {
      await notificationsCollection.insertOne({
        id: crypto.randomUUID(),
        title: "Support Reply",
        message: `${getUserDisplayName(user)} replied to your ticket: ${String(doc.subject || "Support Ticket")}`,
        author: getUserDisplayName(user),
        featured: false,
        readMoreUrl: `/support?ticketId=${encodeURIComponent(ticketId)}`,
        targetUserId: doc.createdBy,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      });
      await pruneCollection(notificationsCollection, 120);
    }
    const updated = await supportTicketsCollection.findOne({ id: ticketId, isDeleted: false });
    return res.json({ ticket: normalizeTicketDoc(updated) });
  } catch (error) {
    console.error("Failed to post ticket message", error);
    return res.status(500).json({ error: "Failed to post ticket message" });
  }
});

app.patch("/api/forum/tickets/:id", async (req, res) => {
  try {
    if (!(await requireMongoReady(res))) return;
    await purgeClosedSupportTickets();
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await clerkClient.users.getUser(auth.userId);
    if (!isAdminUser(user)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const ticketId = normalizeText(req.params.id, 128);
    const status = normalizeTicketStatus(req.body?.status);
    const assigneeId = normalizeText(req.body?.assigneeId, 128);
    if (!ticketId) {
      return res.status(400).json({ error: "Invalid ticket id" });
    }
    await supportTicketsCollection.updateOne(
      { id: ticketId, isDeleted: false },
      {
        $set: {
          status,
          assigneeId: assigneeId || auth.userId,
          updatedAt: new Date().toISOString(),
        },
      },
    );
    const updated = await supportTicketsCollection.findOne({ id: ticketId, isDeleted: false });
    if (!updated) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    return res.json({ ticket: normalizeTicketDoc(updated) });
  } catch (error) {
    console.error("Failed to update support ticket", error);
    return res.status(500).json({ error: "Failed to update support ticket" });
  }
});

app.get("/logo.png", (req, res) => {
  res.sendFile(logoPath);
});

app.get("/env.js", (req, res) => {
  res.type("application/javascript");
  res.send(
    `window.__CLERK_PUBLISHABLE_KEY__ = ${JSON.stringify(CLERK_PUBLISHABLE_KEY)};\nwindow.__STRIPE_PUBLISHABLE_KEY__ = ${JSON.stringify(STRIPE_PUBLISHABLE_KEY)};\nwindow.__LOCAL_DEV_MODE__ = ${JSON.stringify(LOCAL_DEV_MODE)};`,
  );
});

app.get("/health", (req, res) => {
  const mongoReady = Boolean(
    mongoClient &&
    commentsCollection &&
    commentRevisionsCollection &&
    reactionsCollection &&
    newsCollection &&
    notificationsCollection &&
    notificationReadsCollection &&
    cartsCollection &&
    purchasesCollection &&
    supportTicketsCollection &&
    forumPostsCollection &&
    forumPostRevisionsCollection &&
    linkedAccountsCollection &&
    userAchievementsCollection &&
    linkCodesCollection &&
    fulfillmentJobsCollection &&
    grantsCollection,
  );
  res.status(200).json({
    status: "ok",
    service: "hardtale-server-app",
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    mongodb: mongoReady ? "connected" : "reconnecting",
    server: resolvePublicServerHeartbeat(),
  });
});

app.post("/api/telemetry/link-bad-query", (req, res) => {
  try {
    const pathValue = normalizeText(req.body?.path || "", 120);
    const searchValue = normalizeText(req.body?.search || "", 500);
    const source = normalizeText(req.body?.source || "unknown", 80);
    const hasMultipleCode = Boolean(req.body?.hasMultipleCode);
    const unexpectedKeys = Array.isArray(req.body?.unexpectedKeys)
      ? req.body.unexpectedKeys.map((key) => normalizeText(key, 40)).filter(Boolean).slice(0, 20)
      : [];
    console.warn(
      "[link.telemetry.bad_query]",
      JSON.stringify({
        source,
        path: pathValue,
        search: searchValue,
        hasMultipleCode,
        unexpectedKeys,
      }),
    );
    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

app.use("/Images", express.static(imagesDir));
app.use(express.static(publicDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(
    `[startup] env: NODE_ENV=${String(process.env.NODE_ENV || "development")} localDev=${LOCAL_DEV_MODE} ` +
      `serverSecretConfigured=${Boolean(SERVER_SECRET)} pluginTokensConfigured=${PLUGIN_API_TOKENS.length}`,
  );
  if (LOCAL_DEV_MODE) {
    console.log(
      `Local dev mode active: LINK_SERVICE_BASE_URL forced to ${LOCAL_DEV_LINK_SERVICE_BASE_URL}`,
    );
    console.log(
      `Open the site at http://127.0.0.1:${PORT} to ensure frontend API calls stay local.`,
    );
  }
  if (
    LINK_REDEEM_DOWNSTREAM_FALLBACK_ENABLED &&
    LINKING_ENABLED &&
    LINK_SERVICE_LOCALHOST_PATTERN.test(LINK_SERVICE_BASE_URL)
  ) {
    console.warn(
      "LINKING_ENABLED is true but LINK_SERVICE_BASE_URL points to localhost/127.x.x.x. In Render this is usually unreachable for external game/plugin services.",
    );
  }
  if (!LINK_REDEEM_DOWNSTREAM_FALLBACK_ENABLED) {
    console.log(
      "[startup.info] Hosted link-code mode active (expected): /api/link/redeem uses Mongo link codes; downstream plugin redeem fallback is disabled.",
    );
  }
});
