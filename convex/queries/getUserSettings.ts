import { queryGeneric } from "convex/server";
import { v } from "convex/values";

/** Get settings (including Telegram info) for a user */
export const byUserId = queryGeneric({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("userSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
  },
});
