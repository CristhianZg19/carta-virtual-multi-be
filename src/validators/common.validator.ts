import { z } from "zod";

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "El identificador es obligatorio"),
  }),
});

export const paginationQuerySchema = {
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
};

export const booleanQuery = z
  .preprocess((value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }, z.boolean())
  .optional();
