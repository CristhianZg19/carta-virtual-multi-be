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
  async getSettings(restaurantId: string) {
    const settings = await communityRepository.getSettings(restaurantId);
    return publicSettings(settings);
  },

  async updateSettings(restaurantId: string, payload: Partial<Record<string, boolean>>) {
    const settings = await communityRepository.updateSettings(restaurantId, payload);
    if (!settings) throw new AppError("Configuracion no encontrada", 404);
    return publicSettings(settings);
  },

  async listPublicComments(restaurantId: string, query: Record<string, unknown>) {
    const settings = await communityRepository.getSettings(restaurantId);
    if (!settings.commentsEnabled) {
      return { items: [], meta: { page: 1, limit: 12, total: 0, pages: 1 } };
    }

    const result = await communityRepository.listComments(restaurantId, query, true);
    if (!settings.showFeaturedComments && query.isFeatured === true) {
      return { items: [], meta: { ...result.meta, total: 0, pages: 1 } };
    }
    return result;
  },

  async listAdminComments(restaurantId: string, query: Record<string, unknown>) {
    return communityRepository.listComments(restaurantId, query, false);
  },

  async createComment(restaurantId: string, payload: {
    dishId: string;
    guestId: string;
    guestName: string;
    content: string;
  }) {
    const settings = await communityRepository.getSettings(restaurantId);
    if (!settings.commentsEnabled) {
      throw new AppError("Los comentarios estan desactivados", 403);
    }

    const exists = await communityRepository.dishExists(restaurantId, payload.dishId);
    if (!exists) throw new AppError("Plato no encontrado o no disponible", 404);

    const moderation = moderate(payload.content, settings.autoModerationEnabled);
    return communityRepository.createComment(restaurantId, {
      ...payload,
      status: moderation.status,
      moderationReason: moderation.reason,
    });
  },

  async guestDeleteComment(restaurantId: string, id: string, guestId: string) {
    const settings = await communityRepository.getSettings(restaurantId);
    if (!settings.allowGuestDeleteComments) {
      throw new AppError("La eliminacion por clientes esta desactivada", 403);
    }

    const comment = await communityRepository.findComment(restaurantId, id);
    if (!comment) throw new AppError("Comentario no encontrado", 404);
    if (comment.guestId !== guestId) {
      throw new AppError("Solo puedes eliminar comentarios creados desde este dispositivo", 403);
    }

    return communityRepository.deleteComment(restaurantId, id);
  },

  async adminUpdateComment(
    restaurantId: string,
    id: string,
    payload: Partial<{ status: CommentStatus; isFeatured: boolean; isPinned: boolean }>,
  ) {
    const comment = await communityRepository.updateComment(restaurantId, id, payload);
    if (!comment) throw new AppError("Comentario no encontrado", 404);
    return comment;
  },

  async adminDeleteComment(restaurantId: string, id: string) {
    const comment = await communityRepository.deleteComment(restaurantId, id);
    if (!comment) throw new AppError("Comentario no encontrado", 404);
    return comment;
  },

  async toggleCommentLike(restaurantId: string, id: string, guestId: string) {
    const settings = await communityRepository.getSettings(restaurantId);
    if (!settings.likesEnabled) throw new AppError("Los likes estan desactivados", 403);

    const comment = await communityRepository.findComment(restaurantId, id);
    if (!comment || comment.status !== "VISIBLE") throw new AppError("Comentario no disponible", 404);

    const result = await communityRepository.toggleLike(restaurantId, {
      targetType: "COMMENT",
      targetId: id,
      guestId,
      kind: "LIKE",
    });
    const updated = await communityRepository.syncCommentLikeCount(restaurantId, id);
    return { ...result, likeCount: updated?.likeCount ?? 0 };
  },

  async toggleDishLike(restaurantId: string, dishId: string, guestId: string) {
    const settings = await communityRepository.getSettings(restaurantId);
    if (!settings.likesEnabled) throw new AppError("Los likes estan desactivados", 403);

    const exists = await communityRepository.dishExists(restaurantId, dishId);
    if (!exists) throw new AppError("Plato no encontrado o no disponible", 404);

    const result = await communityRepository.toggleLike(restaurantId, {
      targetType: "DISH",
      targetId: dishId,
      dishId,
      guestId,
      kind: "LIKE",
    });
    await communityRepository.calculateRankings(restaurantId, 8);
    return result;
  },

  async toggleDishRecommendation(restaurantId: string, dishId: string, guestId: string) {
    const settings = await communityRepository.getSettings(restaurantId);
    if (!settings.recommendationsEnabled) {
      throw new AppError("Las recomendaciones estan desactivadas", 403);
    }

    const exists = await communityRepository.dishExists(restaurantId, dishId);
    if (!exists) throw new AppError("Plato no encontrado o no disponible", 404);

    const result = await communityRepository.toggleLike(restaurantId, {
      targetType: "DISH",
      targetId: dishId,
      dishId,
      guestId,
      kind: "RECOMMENDATION",
    });
    await communityRepository.calculateRankings(restaurantId, 8);
    return result;
  },

  async rankings(restaurantId: string, limit?: number) {
    const settings = await communityRepository.getSettings(restaurantId);
    if (!settings.showMostRecommended) return [];
    return communityRepository.calculateRankings(restaurantId, limit ?? 8);
  },

  async guestActions(restaurantId: string, guestId: string) {
    return communityRepository.getGuestActions(restaurantId, guestId);
  },

  async analytics(restaurantId: string) {
    return communityRepository.analytics(restaurantId);
  },
};
