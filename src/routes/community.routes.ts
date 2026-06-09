import { Router } from "express";
import {
  adminDeleteComment,
  createComment,
  getCommunityAnalytics,
  getCommunitySettings,
  getGuestActions,
  getRankings,
  guestDeleteComment,
  listAdminComments,
  listPublicComments,
  toggleCommentLike,
  toggleDishLike,
  toggleDishRecommendation,
  updateCommentModeration,
  updateCommunitySettings,
} from "../controllers/community.controller";
import { authenticate, authenticateOptional, authorize } from "../middlewares/auth.middleware";
import { resolveRestaurantScope } from "../middlewares/restaurantScope.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  commentLikeSchema,
  createCommentSchema,
  dishActionSchema,
  guestDeleteCommentSchema,
  listCommentsSchema,
  rankingsQuerySchema,
  updateCommentModerationSchema,
  updateCommunitySettingsSchema,
} from "../validators/community.validator";
import { idParamSchema } from "../validators/common.validator";

export const communityRoutes = Router();

communityRoutes.get("/settings", authenticateOptional, resolveRestaurantScope(), getCommunitySettings);
communityRoutes.get(
  "/comments",
  authenticateOptional,
  resolveRestaurantScope(),
  validate(listCommentsSchema),
  listPublicComments,
);
communityRoutes.post("/comments", resolveRestaurantScope(), validate(createCommentSchema), createComment);
communityRoutes.delete(
  "/comments/:id",
  authenticateOptional,
  resolveRestaurantScope(),
  validate(guestDeleteCommentSchema),
  guestDeleteComment,
);
communityRoutes.post(
  "/comments/:id/like",
  authenticateOptional,
  resolveRestaurantScope(),
  validate(commentLikeSchema),
  toggleCommentLike,
);
communityRoutes.post(
  "/dishes/:dishId/like",
  authenticateOptional,
  resolveRestaurantScope(),
  validate(dishActionSchema),
  toggleDishLike,
);
communityRoutes.post(
  "/dishes/:dishId/recommend",
  authenticateOptional,
  resolveRestaurantScope(),
  validate(dishActionSchema),
  toggleDishRecommendation,
);
communityRoutes.get(
  "/rankings",
  authenticateOptional,
  resolveRestaurantScope(),
  validate(rankingsQuerySchema),
  getRankings,
);
communityRoutes.get("/guest-actions", authenticateOptional, resolveRestaurantScope(), getGuestActions);

communityRoutes.use("/admin", authenticate);
communityRoutes.use("/admin", resolveRestaurantScope());
communityRoutes.put(
  "/admin/settings",
  authorize("ADMIN"),
  validate(updateCommunitySettingsSchema),
  updateCommunitySettings,
);
communityRoutes.get("/admin/comments", validate(listCommentsSchema), listAdminComments);
communityRoutes.patch(
  "/admin/comments/:id",
  authorize("ADMIN", "STAFF"),
  validate(updateCommentModerationSchema),
  updateCommentModeration,
);
communityRoutes.delete(
  "/admin/comments/:id",
  authorize("ADMIN"),
  validate(idParamSchema),
  adminDeleteComment,
);
communityRoutes.get("/admin/analytics", getCommunityAnalytics);
