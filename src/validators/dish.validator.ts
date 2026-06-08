import { z } from "zod";
import { booleanQuery, idParamSchema, paginationQuerySchema } from "./common.validator";

const dishBody = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(5).max(700),
  price: z.coerce.number().min(0),
  image: z.string().min(1).max(600),
  categoryId: z.string().min(1),
  isAvailable: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  order: z.coerce.number().int().min(0).optional().default(0),
  tags: z.array(z.string().min(1).max(40)).optional().default([]),
});

export const listDishesSchema = z.object({
  query: z.object({
    ...paginationQuerySchema,
    search: z.string().optional(),
    categoryId: z.string().optional(),
    tag: z.string().optional(),
    isAvailable: booleanQuery,
    isFeatured: booleanQuery,
  }),
});

export const createDishSchema = z.object({ body: dishBody });

export const updateDishSchema = idParamSchema.extend({
  body: dishBody.partial(),
});
