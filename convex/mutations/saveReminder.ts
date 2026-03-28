import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

/** Add or update a reminder for a user */
export const upsert = mutationGeneric({
  args: {
    userId: v.string(),
    medicineName: v.string(),
    time: v.string(),
    frequency: v.optional(v.string()),
    taken: v.optional(v.boolean()),
    telegramChatId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if a reminder with same userId + time + medicine already exists
    const existing = await ctx.db
      .query("reminders")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("medicineName"), args.medicineName),
          q.eq(q.field("time"), args.time)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        frequency: args.frequency ?? existing.frequency,
        taken: args.taken ?? existing.taken,
        telegramChatId: args.telegramChatId ?? existing.telegramChatId,
      });
      return existing._id;
    }

    return ctx.db.insert("reminders", {
      userId: args.userId,
      medicineName: args.medicineName,
      time: args.time,
      frequency: args.frequency ?? "Once daily",
      taken: args.taken ?? false,
      telegramChatId: args.telegramChatId,
    });
  },
});

/** Mark a reminder as taken / untaken */
export const toggleTaken = mutationGeneric({
  args: {
    id: v.id("reminders"),
  },
  handler: async (ctx, args) => {
    const reminder = await ctx.db.get(args.id);
    if (!reminder) throw new Error("Reminder not found");
    await ctx.db.patch(args.id, { taken: !reminder.taken });
  },
});

/** Delete a reminder */
export const remove = mutationGeneric({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
