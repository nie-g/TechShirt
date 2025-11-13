import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";


/**
 * Create a notification for a single user
 */
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    userType: v.union(v.literal("admin"), v.literal("designer"), v.literal("client")),
    message: v.string(),
    title: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { userId, userType, message, title, type }) => {
    try {
      const userRecord = await ctx.db.get(userId);
      if (!userRecord) throw new Error(`User ${userId} not found`);

      await ctx.db.insert("notifications", {
        recipient_user_id: userId,
        recipient_user_type: userType,
        notif_content: message,
        created_at: Date.now(),
        is_read: false,
      });

       // 🟢 3. Send email notification (optional if user has an email)
      if (userRecord.email) {
        // Use Convex scheduler to call an ACTION (server-side email sender)
        await ctx.scheduler.runAfter(0, api.sendEmail.sendEmailAction, {
          to: userRecord.email,
          subject: "New Notification from TechShirt",
          text: message,
        });
      }

      // 🔔 4. Send push notification via Firebase Cloud Messaging
      // Get all FCM tokens for this user
      const fcmTokens = await ctx.db.query("fcmTokens")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .collect();

      console.log(`📱 Found ${fcmTokens.length} FCM tokens for user ${userId}`);

      if (fcmTokens.length > 0) {
        // Send push notification to all user's devices
        const tokens = fcmTokens.map((t: any) => t.token);
        console.log(`🚀 Sending push notification to ${tokens.length} devices`);

        // Schedule action to send push notifications
        await ctx.scheduler.runAfter(0, api.sendPushNotification.sendPushNotificationToMultipleUsers, {
          fcmTokens: tokens,
          title: title || "🔔 TechShirt Notification",
          body: message,
          data: {
            notificationId: userId.toString(),
            type: type || "notification",
          },
        });
      } else {
        console.log(`⚠️ No FCM tokens found for user ${userId}`);
      }

    } catch (error: any) {
      console.error("Error creating notification:", error);
      return { success: false, error: error.message };
    }
  },
});

/**
 * Create notifications for multiple users
 */
export const createNotificationForMultipleUsers = mutation({
  args: {
    recipients: v.array(
      v.object({
        userId: v.id("users"),
        userType: v.union(v.literal("admin"), v.literal("designer"), v.literal("client")),
      })
    ),
    message: v.string(),
  },
  handler: async (ctx, { recipients, message }) => {
    const results: {
      userId: string;
      userType: "admin" | "designer" | "client";
      success: boolean;
      result?: any;
      error?: string;
    }[] = [];

    for (const recipient of recipients) {
      try {
        const result = await ctx.runMutation(api.notifications.createNotification, {
          userId: recipient.userId,
          userType: recipient.userType,
          message,
        });
        results.push({ ...recipient, success: true, result });
      } catch (error: any) {
        results.push({ ...recipient, success: false, error: error.message });
      }
    }

    return {
      success: true,
      totalRecipients: recipients.length,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
      results,
    };
  },
});

/**
 * Get all notifications for a user
 */
export const getUserNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    try {
      const notifications = await ctx.db
        .query("notifications")
        .filter((q: any) => q.eq(q.field("recipient_user_id"), userId))
        .order("desc")
        .collect();

      return notifications.map((n) => ({
        id: n._id,
        content: n.notif_content,
        createdAt: n.created_at,
        isRead: n.is_read || false,
        recipientType: n.recipient_user_type,
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },
});

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    try {
      const notification = await ctx.db.get(notificationId);
      if (!notification) throw new Error("Notification not found");

      await ctx.db.patch(notificationId, { is_read: true });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    try {
      const notifications = await ctx.db
        .query("notifications")
        .filter((q: any) =>
          q.and(
            q.eq(q.field("recipient_user_id"), userId),
            q.eq(q.field("is_read"), false)
          )
        )
        .collect();

      for (const n of notifications) {
        await ctx.db.patch(n._id, { is_read: true });
      }

      return { success: true, count: notifications.length };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

/**
 * Delete a notification
 */
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    try {
      const notification = await ctx.db.get(notificationId);
      if (!notification) throw new Error("Notification not found");

      await ctx.db.delete(notificationId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});
