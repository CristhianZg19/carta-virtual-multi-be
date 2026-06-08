import { z } from "zod";
import { booleanQuery, idParamSchema, paginationQuerySchema } from "./common.validator";

const categoryBody = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional().default(""),
  order: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const listCategoriesSchema = z.object({
  query: z.object({
    ...paginationQuerySchema,
    search: z.string().optional(),
    isActive: booleanQuery,
  }),
});

export const createCategorySchema = z.object({ body: categoryBody });

export const updateCategorySchema = idParamSchema.extend({
  body: categoryBody.partial(),
});
