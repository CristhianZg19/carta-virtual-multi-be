import { z } from "zod";
import { booleanQuery, idParamSchema, paginationQuerySchema } from "./common.validator";

const settingsBody = z.object({
  commentsEnabled: z.boolean().optional(),
  recommendationsEnabled: z.boolean().optional(),
  likesEnabled: z.boolean().optional(),
  showMostRecommended: z.boolean().optional(),
  showFeaturedComments: z.boolean().optional(),
  autoModerationEnabled: z.boolean().optional(),
  allowGuestDeleteComments: z.boolean().optional(),
});

export const updateCommunitySettingsSchema = z.object({
  body: settingsBody,
});

export const listCommentsSchema = z.object({
  query: z.object({
    ...paginationQuerySchema,
    dishId: z.string().optional(),
    search: z.string().optional(),
    guestId: z.string().optional(),
    status: z.enum(["VISIBLE", "HIDDEN"]).optional(),
    isFeatured: booleanQuery,
    isPinned: booleanQuery,
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    dishId: z.string().min(1),
    guestId: z.string().min(8).max(120),
    guestName: z.string().min(2).max(80),
    content: z.string().min(3).max(700),
  }),
});

export const guestDeleteCommentSchema = idParamSchema.extend({
  body: z.object({
    guestId: z.string().min(8).max(120),
  }),
});

export const updateCommentModerationSchema = idParamSchema.extend({
  body: z.object({
    status: z.enum(["VISIBLE", "HIDDEN"]).optional(),
    isFeatured: z.boolean().optional(),
    isPinned: z.boolean().optional(),
  }),
});

export const commentLikeSchema = idParamSchema.extend({
  body: z.object({
    guestId: z.string().min(8).max(120),
  }),
});

export const dishActionSchema = z.object({
  params: z.object({
    dishId: z.string().min(1),
  }),
  body: z.object({
    guestId: z.string().min(8).max(120),
  }),
});

export const rankingsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(20).optional(),
  }),
});
