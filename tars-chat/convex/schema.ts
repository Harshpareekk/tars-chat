import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
  }).index("by_clerkId", ["clerkId"]),

  messages: defineTable({
    body: v.string(),
    author: v.string(), 
    senderId: v.id("users"),   
    receiverId: v.id("users"), 
    // Requirement #12: Store an array of emoji reactions
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      userId: v.id("users")
    })))
  }).index("by_conversation", ["senderId", "receiverId"]),
});