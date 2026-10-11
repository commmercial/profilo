import express from "express";
import cors from "cors";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const apiId = Number(process.env.TELEGRAM_API_ID || 0);
const apiHash = process.env.TELEGRAM_API_HASH || "";
const session = process.env.TELEGRAM_SESSION || "";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://v.pntr.dev";

app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigin }));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

let client;
let lastPhoto = null;
let lastPhotoType = "image/jpeg";
let photoCheckedAt = 0;

async function connectTelegram() {
  if (!apiId || !apiHash || !session) {
    throw new Error("Missing Telegram environment variables.");
  }

  client = new TelegramClient(new StringSession(session), apiId, apiHash, {
    connectionRetries: 5
  });

  await client.connect();

  if (!(await client.checkAuthorization())) {
    throw new Error("Telegram session is not authorized. Complete authorization locally and set TELEGRAM_SESSION in your host's private environment variables.");
  }
}

function formatStatus(user) {
  const status = user?.status;
  const kind = status?.className || "";

  if (kind === "UserStatusOnline") return "online";
  if (kind === "UserStatusRecently") return "last seen recently";
  if (kind === "UserStatusLastWeek") return "last seen within a week";
  if (kind === "UserStatusLastMonth") return "last seen within a month";
  if (kind === "UserStatusOffline") return "last seen recently";
  return "status unavailable";
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/telegram", async (_req, res) => {
  try {
    if (!client?.connected) await connectTelegram();
    const me = await client.getMe();
    res.json({
      username: me.username ? "@" + me.username : "",
      status: formatStatus(me),
      updatedAt: new Date().toISOString()
    });
  } catch {
    res.status(503).json({ error: "Telegram status is not configured yet." });
  }
});

app.get("/api/telegram/photo", async (_req, res) => {
  try {
    if (!client?.connected) await connectTelegram();

    if (!lastPhoto || Date.now() - photoCheckedAt > 60_000) {
      const photo = await client.downloadProfilePhoto("me", { isBig: true });
      if (!photo || !photo.length) {
        res.status(404).end();
        return;
      }
      lastPhoto = Buffer.from(photo);
      photoCheckedAt = Date.now();
    }

    res.setHeader("Content-Type", lastPhotoType);
    res.setHeader("Cache-Control", "public, max-age=60");
    res.send(lastPhoto);
  } catch {
    res.status(503).json({ error: "Telegram profile photo is not configured yet." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Telegram presence backend listening on port ${port}`);
});
