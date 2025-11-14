import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ✅ Check if a rating already exists for a design by a reviewer
export const getExistingRating = query({
  args: {
    designId: v.id("design"),
    reviewerId: v.id("users"),
  },
  handler: async ({ db }, { designId, reviewerId }) => {
    return await db
      .query("ratings_feedback")
      .withIndex("by_design", (q) => q.eq("design_id", designId))
      .filter((q) => q.eq(q.field("reviewer_id"), reviewerId))
      .first();
  },
});

// ✅ Updated mutation: creates new rating or updates existing one
export const addRating = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    designId: v.id("design"),
    reviewerId: v.id("users"),
    rating: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async ({ db }, { portfolioId, designId, reviewerId, rating, feedback }) => {
    // Check if rating already exists
    const existingRating = await db
      .query("ratings_feedback")
      .withIndex("by_design", (q) => q.eq("design_id", designId))
      .filter((q) => q.eq(q.field("reviewer_id"), reviewerId))
      .first();

    if (existingRating) {
      // Update existing rating
      await db.patch(existingRating._id, {
        rating,
        feedback: feedback || "",
        updated_at: Date.now(),
      });
      return existingRating._id;
    } else {
      // Create new rating
      return await db.insert("ratings_feedback", {
        portfolio_id: portfolioId,
        design_id: designId,
        reviewer_id: reviewerId,
        rating,
        feedback: feedback || "",
        created_at: Date.now(),
      });
    }
  },
});

export const listAll = query(async ({ db }) => {
  return await db.query("ratings_feedback").collect();
});