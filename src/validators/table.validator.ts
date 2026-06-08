import { z } from "zod";
import { idParamSchema } from "./common.validator";

const tableBody = z.object({
  name: z.string().min(1).max(80),
  code: z.string().min(2).max(60).optional(),
  isActive: z.boolean().optional().default(true),
});

export const createTableSchema = z.object({ body: tableBody });

export const updateTableSchema = idParamSchema.extend({
  body: tableBody.partial(),
});
