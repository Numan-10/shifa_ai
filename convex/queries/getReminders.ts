import { queryGeneric } from "convex/server";
import { v } from "convex/values";

/** Get all reminders for a user */
export const byUserId = queryGeneric({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("reminders")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

/** Get reminders due at a specific time for a user */
export const byUserIdAndTime = queryGeneric({
  args: { userId: v.string(), time: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("reminders")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("time"), args.time))
      .collect();
  },
});
