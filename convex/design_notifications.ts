// convex/mutations/designNotifications.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const notifyClientDesignUpdate = mutation({
  args: { designId: v.id("design") },
  handler: async (ctx, { designId }) => {
    const design = await ctx.db.get(designId);
    if (!design) throw new Error("Design not found");

    const clientId = design.client_id;
    if (!clientId) throw new Error("Design has no associated client");

    // 1. Update design status
    await ctx.db.patch(designId, { status: "in_progress" });

    // 2. Send notification
    await ctx.runMutation(api.notifications.createNotification, {
      userId: clientId,
      userType: "client",
      title: "Design Update",
      message: `Your design has a new update from the designer.`,
      type: "design_update",
    });

    return { success: true };
  },
});
