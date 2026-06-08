import { z } from "zod";

export const generateQrSchema = z.object({
  body: z
    .object({
      targetUrl: z.string().url().optional(),
      tableId: z.string().min(1).optional(),
      tableCode: z.string().min(1).optional(),
    })
    .partial(),
});
