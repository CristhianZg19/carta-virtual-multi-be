import { creatorService } from "../services/creator.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getRequestMeta } from "../utils/requestMeta";

export const creatorLogin = asyncHandler(async (req, res) => {
  const result = await creatorService.login(req.body.username, req.body.password, getRequestMeta(req));
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

export const listLoginTraces = asyncHandler(async (req, res) => {
  const traces = await creatorService.listLoginTraces(req.query);
  return sendSuccess(res, 200, "Logs de inicio de sesion obtenidos", traces);
});

export const deleteLoginTrace = asyncHandler(async (req, res) => {
  const trace = await creatorService.deleteLoginTrace(req.params.id);
  return sendSuccess(res, 200, "Log de inicio de sesion eliminado", trace);
});

export const listSecurityEvents = asyncHandler(async (req, res) => {
  const events = await creatorService.listSecurityEvents(req.query);
  return sendSuccess(res, 200, "Eventos de seguridad obtenidos", events);
});

export const listBlockedIps = asyncHandler(async (req, res) => {
  const blockedIps = await creatorService.listBlockedIps(req.query);
  return sendSuccess(res, 200, "IPs bloqueadas obtenidas", blockedIps);
});

export const blockIp = asyncHandler(async (req, res) => {
  const blockedIp = await creatorService.blockIp(req.body.ip, req.body.reason, req.creatorAdmin?.username);
  return sendSuccess(res, 201, "IP bloqueada", blockedIp);
});

export const unblockIp = asyncHandler(async (req, res) => {
  const blockedIp = await creatorService.unblockIp(req.params.id, req.creatorAdmin?.username);
  return sendSuccess(res, 200, "IP desbloqueada", blockedIp);
});

export const updateCompanyStatus = asyncHandler(async (req, res) => {
  const company = await creatorService.updateCompanyStatus(req.params.id, req.body.isActive);
  return sendSuccess(res, 200, "Estado de empresa actualizado", company);
});

export const createCompany = asyncHandler(async (req, res) => {
  const company = await creatorService.createCompany(req.body);
  return sendSuccess(res, 201, "Empresa creada", company);
});
