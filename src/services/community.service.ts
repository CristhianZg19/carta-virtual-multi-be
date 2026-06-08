import type { CommentStatus } from "../models/comment.model";
import { communityRepository } from "../repositories/community.repository";
import { AppError } from "../utils/errors";

const blockedTerms = ["spam", "casino", "http://", "https://", "xxx"];

const publicSettings = (settings: Awaited<ReturnType<typeof communityRepository.getSettings>>) => ({
  commentsEnabled: settings.commentsEnabled,
  recommendationsEnabled: settings.recommendationsEnabled,
  likesEnabled: settings.likesEnabled,
  showMostRecommended: settings.showMostRecommended,
  showFeaturedComments: settings.showFeaturedComments,
  autoModerationEnabled: settings.autoModerationEnabled,
  allowGuestDeleteComments: settings.allowGuestDeleteComments,
});

const moderate = (content: string, enabled: boolean): { status: CommentStatus; reason?: string } => {
  if (!enabled) return { status: "VISIBLE" };
  const normalized = content.toLowerCase();
  const matched = blockedTerms.find((term) => normalized.includes(term));
  if (!matched) return { status: "VISIBLE" };
  return { status: "HIDDEN", reason: `Auto moderation: ${matched}` };
};

export const communityService = {
  async getSettings() {
    const settings = await communityRepository.getSettings();
    return publicSettings(settings);
  },

  async updateSettings(payload: Partial<Record<string, boolean>>) {
    const settings = await communityRepository.updateSettings(payload);
    if (!settings) throw new AppError("Configuracion no encontrada", 404);
    return publicSettings(settings);
  },

  async listPublicComments(query: Record<string, unknown>) {
    const settings = await communityRepository.getSettings();
    if (!settings.commentsEnabled) {
      return { items: [], meta: { page: 1, limit: 12, total: 0, pages: 1 } };
    }

    const result = await communityRepository.listComments(query, true);
    if (!settings.showFeaturedComments && query.isFeatured === true) {
      return { items: [], meta: { ...result.meta, total: 0, pages: 1 } };
    }
    return result;
  },

  async listAdminComments(query: Record<string, unknown>) {
    return communityRepository.listComments(query, false);
  },

  async createComment(payload: {
    dishId: string;
    guestId: string;
    guestName: string;
    content: string;
  }) {
    const settings = await communityRepository.getSettings();
    if (!settings.commentsEnabled) {
      throw new AppError("Los comentarios estan desactivados", 403);
    }

    const exists = await communityRepository.dishExists(payload.dishId);
    if (!exists) throw new AppError("Plato no encontrado o no disponible", 404);

    const moderation = moderate(payload.content, settings.autoModerationEnabled);
    return communityRepository.createComment({
      ...payload,
      status: moderation.status,
      moderationReason: moderation.reason,
    });
  },

  async guestDeleteComment(id: string, guestId: string) {
    const settings = await communityRepository.getSettings();
    if (!settings.allowGuestDeleteComments) {
      throw new AppError("La eliminacion por clientes esta desactivada", 403);
    }

    const comment = await communityRepository.findComment(id);
    if (!comment) throw new AppError("Comentario no encontrado", 404);
    if (comment.guestId !== guestId) {
      throw new AppError("Solo puedes eliminar comentarios creados desde este dispositivo", 403);
    }

    return communityRepository.deleteComment(id);
  },

  async adminUpdateComment(
    id: string,
    payload: Partial<{ status: CommentStatus; isFeatured: boolean; isPinned: boolean }>,
  ) {
    const comment = await communityRepository.updateComment(id, payload);
    if (!comment) throw new AppError("Comentario no encontrado", 404);
    return comment;
  },

  async adminDeleteComment(id: string) {
    const comment = await communityRepository.deleteComment(id);
    if (!comment) throw new AppError("Comentario no encontrado", 404);
    return comment;
  },

  async toggleCommentLike(id: string, guestId: string) {
    const settings = await communityRepository.getSettings();
    if (!settings.likesEnabled) throw new AppError("Los likes estan desactivados", 403);

    const comment = await communityRepository.findComment(id);
    if (!comment || comment.status !== "VISIBLE") throw new AppError("Comentario no disponible", 404);

    const result = await communityRepository.toggleLike({
      targetType: "COMMENT",
      targetId: id,
      guestId,
      kind: "LIKE",
    });
    const updated = await communityRepository.syncCommentLikeCount(id);
    return { ...result, likeCount: updated?.likeCount ?? 0 };
  },

  async toggleDishLike(dishId: string, guestId: string) {
    const settings = await communityRepository.getSettings();
    if (!settings.likesEnabled) throw new AppError("Los likes estan desactivados", 403);

    const exists = await communityRepository.dishExists(dishId);
    if (!exists) throw new AppError("Plato no encontrado o no disponible", 404);

    const result = await communityRepository.toggleLike({
      targetType: "DISH",
      targetId: dishId,
      dishId,
      guestId,
      kind: "LIKE",
    });
    await communityRepository.calculateRankings(8);
    return result;
  },

  async toggleDishRecommendation(dishId: string, guestId: string) {
    const settings = await communityRepository.getSettings();
    if (!settings.recommendationsEnabled) {
      throw new AppError("Las recomendaciones estan desactivadas", 403);
    }

    const exists = await communityRepository.dishExists(dishId);
    if (!exists) throw new AppError("Plato no encontrado o no disponible", 404);

    const result = await communityRepository.toggleLike({
      targetType: "DISH",
      targetId: dishId,
      dishId,
      guestId,
      kind: "RECOMMENDATION",
    });
    await communityRepository.calculateRankings(8);
    return result;
  },

  async rankings(limit?: number) {
    const settings = await communityRepository.getSettings();
    if (!settings.showMostRecommended) return [];
    return communityRepository.calculateRankings(limit ?? 8);
  },

  async guestActions(guestId: string) {
    return communityRepository.getGuestActions(guestId);
  },

  async analytics() {
    return communityRepository.analytics();
  },
};
