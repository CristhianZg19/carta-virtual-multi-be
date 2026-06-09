import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { getRequestMeta } from "../utils/requestMeta";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(
    req.body.email,
    req.body.password,
    req.body.restaurantSlug,
    getRequestMeta(req),
  );
  return sendSuccess(res, 200, "Sesion iniciada correctamente", result);
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user!.id);
  return sendSuccess(res, 200, "Usuario autenticado", user);
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await authService.changePassword(
    req.user!.id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  return sendSuccess(res, 200, "Contrasena actualizada", user);
});
