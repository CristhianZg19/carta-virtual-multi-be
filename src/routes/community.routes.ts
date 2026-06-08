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
import { authenticate, authorize } from "../middlewares/auth.middleware";
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

communityRoutes.get("/settings", getCommunitySettings);
communityRoutes.get("/comments", validate(listCommentsSchema), listPublicComments);
communityRoutes.post("/comments", validate(createCommentSchema), createComment);
communityRoutes.delete("/comments/:id", validate(guestDeleteCommentSchema), guestDeleteComment);
communityRoutes.post("/comments/:id/like", validate(commentLikeSchema), toggleCommentLike);
communityRoutes.post("/dishes/:dishId/like", validate(dishActionSchema), toggleDishLike);
communityRoutes.post("/dishes/:dishId/recommend", validate(dishActionSchema), toggleDishRecommendation);
communityRoutes.get("/rankings", validate(rankingsQuerySchema), getRankings);
communityRoutes.get("/guest-actions", getGuestActions);

communityRoutes.use("/admin", authenticate);
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
