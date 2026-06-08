import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email invalido"),
    password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
  }),
});
