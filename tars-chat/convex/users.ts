import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Called storeUser without authentication");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user !== null) return user._id;

    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "No Email",
      image: identity.pictureUrl ?? "",
      clerkId: identity.subject,
    });
  },
});

// New Query: Gets users AND their last message with you (Requirement #3)
export const getUsersWithLastMessage = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    const allUsers = await ctx.db.query("users").collect();
    
    // Logic to find the last message for the sidebar preview
    const usersWithMessages = await Promise.all(
      allUsers.map(async (user) => {
        const lastMessage = await ctx.db
          .query("messages")
          .filter((q) =>
            q.or(
              q.and(q.eq(q.field("senderId"), currentUser._id), q.eq(q.field("receiverId"), user._id)),
              q.and(q.eq(q.field("senderId"), user._id), q.eq(q.field("receiverId"), currentUser._id))
            )
          )
          .order("desc")
          .first();

        return {
          ...user,
          lastMessage: lastMessage?.body || "No messages yet",
        };
      })
    );

    return usersWithMessages;
  },
});