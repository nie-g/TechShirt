import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveFcmToken = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
  },
  handler: async (ctx, { userId, token }) => {
    // Convert Convex ID to string for storage
    const userIdStr = userId.toString();

    // Check if this exact token already exists for this user
    const existing = await ctx.db.query("fcmTokens")
      .withIndex("by_userId", (q: any) => q.eq("userId", userIdStr))
      .filter((q: any) => q.eq(q.field("token"), token))
      .first();

    // Only insert if this token doesn't already exist for this user
    if (!existing) {
      console.log(`💾 Saving FCM token for user ${userIdStr}`);
      await ctx.db.insert("fcmTokens", {
        userId: userIdStr,
        token,
      });
      console.log(`✅ FCM token saved successfully`);
    } else {
      console.log(`⚠️ FCM token already exists for user ${userIdStr}`);
    }
  },
});
