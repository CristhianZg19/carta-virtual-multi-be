import { creatorService } from "../services/creator.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const creatorLogin = asyncHandler(async (req, res) => {
  const result = await creatorService.login(req.body.username, req.body.password);
  return sendSuccess(res, 200, "Sesion de creador iniciada", result);
});

export const getCreatorMe = asyncHandler(async (req, res) => {
  const user = await creatorService.me(req.creatorAdmin!.id);
  return sendSuccess(res, 200, "Usuario creador autenticado", user);
});

export const changeCreatorPassword = asyncHandler(async (req, res) => {
  const user = await creatorService.changePassword(
    req.creatorAdmin!.id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  return sendSuccess(res, 200, "Contrasena actualizada", user);
});

export const listCompanies = asyncHandler(async (_req, res) => {
  const companies = await creatorService.listCompanies();
  return sendSuccess(res, 200, "Empresas obtenidas", companies);
});

export const updateCompanyStatus = asyncHandler(async (req, res) => {
  const company = await creatorService.updateCompanyStatus(req.params.id, req.body.isActive);
  return sendSuccess(res, 200, "Estado de empresa actualizado", company);
});

export const createCompany = asyncHandler(async (req, res) => {
  const company = await creatorService.createCompany(req.body);
  return sendSuccess(res, 201, "Empresa creada", company);
});
