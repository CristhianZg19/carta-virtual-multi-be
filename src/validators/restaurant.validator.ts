import { z } from "zod";

export const updateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    slug: z.string().min(2).max(120).optional(),
    storageFolder: z.string().min(2).max(120).optional(),
    logo: z.string().max(600).optional(),
    description: z.string().max(700).optional(),
    address: z.string().max(250).optional(),
    phone: z.string().max(60).optional(),
    whatsapp: z.string().max(60).optional(),
    showWhatsapp: z.boolean().optional(),
    openingHours: z.string().max(180).optional(),
    socialLinks: z
      .object({
        instagram: z.string().max(250).optional(),
        facebook: z.string().max(250).optional(),
        tiktok: z.string().max(250).optional(),
        website: z.string().max(250).optional(),
      })
      .partial()
      .optional(),
    brandColors: z
      .object({
        primary: z.string().max(20).optional(),
        accent: z.string().max(20).optional(),
      })
      .partial()
      .optional(),
  }),
});
