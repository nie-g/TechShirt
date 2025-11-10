import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const listInvites = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("revoked"),
        v.literal("accepted")
      )
    ),
  },
  handler: async (ctx, args) => {
    let invites = await ctx.db.query("invites").collect();

    // ✅ Filter (optional)
    if (args.status) {
      invites = invites.filter((i) => i.status === args.status);
    }

    // ✅ Sort newest → oldest
    invites.sort((a, b) => b.createdAt - a.createdAt);

    return invites;
  },
});


export const createInvite = mutation({
  args: {
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { email, token, expiresAt }) => {
    return await ctx.db.insert("invites", {
      email,
      token,
      expiresAt,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const acceptInvite = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_email", q => q.eq("email", email))   // ✅ FIX
      .first();

    if (!invite) return;

    await ctx.db.patch(invite._id, {
      status: "accepted",
      acceptedAt: Date.now(),
    });
  },
});
