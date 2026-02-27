import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: { body: v.string(), author: v.string(), senderId: v.id("users"), receiverId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      body: args.body,
      author: args.author,
      senderId: args.senderId,
      receiverId: args.receiverId,
      reactions: [] // Initialize empty
    });
  },
});

// Requirement #12: Toggle Reaction Logic
export const toggleReaction = mutation({
  args: { messageId: v.id("messages"), emoji: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    const reactions = message.reactions || [];
    const existingIndex = reactions.findIndex(
      (r) => r.emoji === args.emoji && r.userId === args.userId
    );

    if (existingIndex > -1) {
      reactions.splice(existingIndex, 1); // Remove if clicked again
    } else {
      reactions.push({ emoji: args.emoji, userId: args.userId }); // Add new
    }
    await ctx.db.patch(args.messageId, { reactions });
  },
});

export const getPrivateMessages = query({
  args: { userA: v.id("users"), userB: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) =>
        q.or(
          q.and(q.eq(q.field("senderId"), args.userA), q.eq(q.field("receiverId"), args.userB)),
          q.and(q.eq(q.field("senderId"), args.userB), q.eq(q.field("receiverId"), args.userA))
        )
      )
      .collect();
  },
});