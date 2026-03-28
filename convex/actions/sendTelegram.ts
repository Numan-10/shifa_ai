"use node";

import { actionGeneric, anyApi } from "convex/server";
import { v } from "convex/values";

const TELEGRAM_API = "https://api.telegram.org";

/**
 * Send a Telegram reminder message to a user.
 * Called from the appointments page when a reminder time is reached.
 */
export const sendTelegramReminder = actionGeneric({
  args: {
    chatId: v.string(),
    medicineName: v.string(),
    time: v.string(),
    frequency: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean(), error: v.optional(v.string()) }),
  handler: async (_ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return { ok: false, error: "Telegram bot token not configured" };
    }

    const freq = args.frequency ? `\n📅 *Frequency:* ${args.frequency}` : "";
    const message =
      `💊 *Medication Reminder* — Shifa AI\n\n` +
      `It's time to take:\n` +
      `*${args.medicineName}*\n\n` +
      `🕐 *Scheduled:* ${args.time}${freq}\n\n` +
      `_Stay healthy and consistent! 🌿_`;

    try {
      const res = await fetch(
        `${TELEGRAM_API}/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: args.chatId,
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );

      const data = (await res.json()) as { ok: boolean; description?: string };
      if (!data.ok) {
        return { ok: false, error: data.description ?? "Unknown Telegram error" };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  },
});

/**
 * Test the Telegram connection by sending a welcome message.
 */
export const sendTelegramWelcome = actionGeneric({
  args: {
    chatId: v.string(),
    userName: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean(), error: v.optional(v.string()) }),
  handler: async (_ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return { ok: false, error: "Telegram bot token not configured" };
    }

    const name = args.userName ? `, ${args.userName}` : "";
    const message =
      `✅ *Shifa AI connected!*\n\n` +
      `Hello${name}! 👋\n\n` +
      `You'll now receive your medication reminders here on Telegram. ` +
      `Make sure to add your reminders in the Shifa AI app.\n\n` +
      `💊 _Stay healthy!_`;

    try {
      const res = await fetch(
        `${TELEGRAM_API}/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: args.chatId,
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );

      const data = (await res.json()) as { ok: boolean; description?: string };
      if (!data.ok) {
        return { ok: false, error: data.description ?? "Unknown Telegram error" };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  },
});
