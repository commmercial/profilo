import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";

const apiIdText = await input.text("Telegram API ID: ");
const apiId = Number(apiIdText.trim());
const apiHash = (await input.text("Telegram API Hash: ")).trim();

if (!Number.isInteger(apiId) || apiId <= 0 || !apiHash) {
  console.error("A valid API ID and API Hash are required.");
  process.exit(1);
}

const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
  connectionRetries: 5
});

try {
  await client.start({
    phoneNumber: async () => await input.text("Telegram phone number (include country code): "),
    phoneCode: async () => await input.text("Login code from Telegram: "),
    password: async () => await input.text("Two-step verification password (if enabled): "),
    onError: (error) => console.error("Telegram authorization error:", error.message)
  });

  console.log("\nAuthorization complete. Copy the session string below directly into your hosting provider's PRIVATE TELEGRAM_SESSION environment variable.");
  console.log("Never paste this string into GitHub, a website file, or a chat. Anyone who has it may be able to access your Telegram account.\n");
  console.log(client.session.save());
} finally {
  await client.disconnect();
}
