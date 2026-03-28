import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Telegram Webhook — receives updates from Telegram when a user sends /start
 * 
 * The /start command should be sent with a payload containing the userId:
 *   /start <userId>
 * 
 * Set this webhook URL in BotFather or via the Telegram API:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook
 */
export async function POST(req: NextRequest) {
  try {
    // Security: verify the request has the correct secret token
    const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
    if (
      process.env.TELEGRAM_WEBHOOK_SECRET &&
      secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as TelegramUpdate;
    const message = body.message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text ?? "";
    const username = message.from?.username;
    const firstName = message.from?.first_name;

    // Handle /start command — expects: /start <userId>
    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const userId = parts[1]; // The Shifa AI userId passed via deep link

      if (userId) {
        // Save the Telegram chat ID linked to this Shifa AI user
        await convex.mutation(anyApi.mutations.saveUserSettings.saveTelegramConnection, {
          userId,
          telegramChatId: chatId,
          telegramUsername: username,
        });

        // Send a welcome message back via Telegram
        await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text:
                `✅ *Shifa AI connected!*\n\n` +
                `Hello${firstName ? `, ${firstName}` : ""}! 👋\n\n` +
                `You'll now receive your medication reminders here on Telegram.\n\n` +
                `💊 _Stay healthy!_`,
              parse_mode: "Markdown",
            }),
          }
        );
      } else {
        // /start without userId — just greet
        await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text:
                `👋 Hello! I'm the *Shifa AI* reminder bot.\n\n` +
                `To connect your account, please open Shifa AI and click *"Connect Telegram"* in the Reminders section.\n\n` +
                `💊 _Your health assistant awaits!_`,
              parse_mode: "Markdown",
            }),
          }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Telegram Webhook Error]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET endpoint — used to verify webhook is alive
export async function GET() {
  return NextResponse.json({ ok: true, service: "Shifa AI Telegram Webhook" });
}

// ---- Telegram Update Types ----
interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

interface TelegramUser {
  id: number;
  first_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: string;
}
