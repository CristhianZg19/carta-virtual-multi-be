import { z } from "zod";

const password = z.string().min(8, "La contrasena debe tener al menos 8 caracteres");

export const creatorLoginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(80),
    password,
  }),
});

export const creatorChangePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: password,
      newPassword: password,
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "La nueva contrasena debe ser diferente",
      path: ["newPassword"],
    }),
});

export const createCompanySchema = z.object({
  body: z.object({
    restaurant: z.object({
      name: z.string().min(2).max(120),
      slug: z.string().min(2).max(120).optional(),
      description: z.string().max(700).optional().default(""),
      address: z.string().max(250).optional().default(""),
      phone: z.string().max(60).optional().default(""),
      whatsapp: z.string().max(60).optional().default(""),
      openingHours: z.string().max(180).optional().default(""),
      primaryColor: z.string().max(20).optional().default("#173c34"),
      accentColor: z.string().max(20).optional().default("#d96b43"),
    }),
    admin: z.object({
      name: z.string().min(2).max(120),
      email: z.string().email("Email invalido"),
      password,
    }),
  }),
});
