import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email invalido"),
    password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
    restaurantSlug: z.string().min(2).max(120).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(8, "La contrasena actual debe tener al menos 8 caracteres"),
      newPassword: z.string().min(8, "La nueva contrasena debe tener al menos 8 caracteres"),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "La nueva contrasena debe ser diferente",
      path: ["newPassword"],
    }),
});
