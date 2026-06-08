import { communityService } from "../services/community.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const getCommunitySettings = asyncHandler(async (_req, res) => {
  const settings = await communityService.getSettings();
  return sendSuccess(res, 200, "Configuracion de comunidad obtenida", settings);
});

export const updateCommunitySettings = asyncHandler(async (req, res) => {
  const settings = await communityService.updateSettings(req.body);
  return sendSuccess(res, 200, "Configuracion de comunidad actualizada", settings);
});

export const listPublicComments = asyncHandler(async (req, res) => {
  const result = await communityService.listPublicComments(req.query);
  return sendSuccess(res, 200, "Comentarios obtenidos", result.items, result.meta);
});

export const listAdminComments = asyncHandler(async (req, res) => {
  const result = await communityService.listAdminComments(req.query);
  return sendSuccess(res, 200, "Comentarios obtenidos", result.items, result.meta);
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await communityService.createComment(req.body);
  return sendSuccess(res, 201, "Comentario publicado", comment);
});

export const guestDeleteComment = asyncHandler(async (req, res) => {
  const comment = await communityService.guestDeleteComment(req.params.id, req.body.guestId);
  return sendSuccess(res, 200, "Comentario eliminado", comment);
});

export const updateCommentModeration = asyncHandler(async (req, res) => {
  const comment = await communityService.adminUpdateComment(req.params.id, req.body);
  return sendSuccess(res, 200, "Comentario actualizado", comment);
});

export const adminDeleteComment = asyncHandler(async (req, res) => {
  const comment = await communityService.adminDeleteComment(req.params.id);
  return sendSuccess(res, 200, "Comentario eliminado", comment);
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
  const result = await communityService.toggleCommentLike(req.params.id, req.body.guestId);
  return sendSuccess(res, 200, "Like actualizado", result);
});

export const toggleDishLike = asyncHandler(async (req, res) => {
  const result = await communityService.toggleDishLike(req.params.dishId, req.body.guestId);
  return sendSuccess(res, 200, "Like de plato actualizado", result);
});

export const toggleDishRecommendation = asyncHandler(async (req, res) => {
  const result = await communityService.toggleDishRecommendation(req.params.dishId, req.body.guestId);
  return sendSuccess(res, 200, "Recomendacion actualizada", result);
});

export const getRankings = asyncHandler(async (req, res) => {
  const rankings = await communityService.rankings(Number(req.query.limit) || undefined);
  return sendSuccess(res, 200, "Rankings obtenidos", rankings);
});

export const getGuestActions = asyncHandler(async (req, res) => {
  const actions = await communityService.guestActions(String(req.query.guestId));
  return sendSuccess(res, 200, "Acciones del invitado obtenidas", actions);
});

export const getCommunityAnalytics = asyncHandler(async (_req, res) => {
  const analytics = await communityService.analytics();
  return sendSuccess(res, 200, "Analitica de comunidad obtenida", analytics);
});
