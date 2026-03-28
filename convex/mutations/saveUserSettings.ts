import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

/** Save or update Telegram connection for a user */
export const saveTelegramConnection = mutationGeneric({
  args: {
    userId: v.string(),
    telegramChatId: v.string(),
    telegramUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        telegramChatId: args.telegramChatId,
        telegramUsername: args.telegramUsername,
        telegramConnectedAt: Date.now(),
      });
      return existing._id;
    }

    return ctx.db.insert("userSettings", {
      userId: args.userId,
      telegramChatId: args.telegramChatId,
      telegramUsername: args.telegramUsername,
      telegramConnectedAt: Date.now(),
    });
  },
});

/** Disconnect Telegram from a user account */
export const disconnectTelegram = mutationGeneric({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        telegramChatId: undefined,
        telegramUsername: undefined,
        telegramConnectedAt: undefined,
      });
    }
  },
});
