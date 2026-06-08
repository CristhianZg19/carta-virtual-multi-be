import { Types } from "mongoose";
import { AnalyticsSnapshot } from "../models/analyticsSnapshot.model";
import { Comment, type CommentStatus } from "../models/comment.model";
import { CommunitySettings } from "../models/communitySettings.model";
import { Dish } from "../models/dish.model";
import { DishRanking } from "../models/dishRanking.model";
import { Like, type LikeKind, type LikeTargetType } from "../models/like.model";
import { resolveImageUrl } from "../utils/images";
import { getPagination, getPaginationMeta } from "../utils/pagination";

interface CommentFilters {
  dishId?: string;
  search?: string;
  status?: CommentStatus;
  guestId?: string;
  isFeatured?: boolean;
  isPinned?: boolean;
  page?: unknown;
  limit?: unknown;
}

interface RankingRow {
  dishId: string;
  commentCount: number;
  recommendationCount: number;
  likeCount: number;
  weeklyRecommendations: number;
  monthlyRecommendations: number;
  score: number;
}

const asObjectId = (id: string) => new Types.ObjectId(id);

const getStartOfDay = (daysBack: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysBack);
  return date;
};

export const communityRepository = {
  async getSettings() {
    const existing = await CommunitySettings.findOne().sort({ createdAt: 1 });
    if (existing) return existing;
    return CommunitySettings.create({});
  },

  async updateSettings(payload: Partial<Record<string, boolean>>) {
    return CommunitySettings.findOneAndUpdate({}, payload, {
      new: true,
      runValidators: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
  },

  async dishExists(dishId: string) {
    if (!Types.ObjectId.isValid(dishId)) return false;
    return Dish.exists({ _id: dishId, isAvailable: true });
  },

  async createComment(payload: {
    dishId: string;
    guestId: string;
    guestName: string;
    content: string;
    status: CommentStatus;
    moderationReason?: string;
  }) {
    return Comment.create({
      ...payload,
      dishId: asObjectId(payload.dishId),
    });
  },

  async listComments(filters: CommentFilters, forceVisibleOnly = false) {
    const { page, limit, skip } = getPagination(filters);
    const query: Record<string, unknown> = {};

    if (filters.dishId && Types.ObjectId.isValid(filters.dishId)) {
      query.dishId = filters.dishId;
    }

    if (filters.guestId) query.guestId = filters.guestId;
    if (typeof filters.isFeatured === "boolean") query.isFeatured = filters.isFeatured;
    if (typeof filters.isPinned === "boolean") query.isPinned = filters.isPinned;
    if (forceVisibleOnly) {
      query.status = "VISIBLE";
    } else if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { content: { $regex: filters.search, $options: "i" } },
        { guestName: { $regex: filters.search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Comment.find(query)
        .populate("dishId", "name image price")
        .sort({ isPinned: -1, isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(query),
    ]);

    return { items, meta: getPaginationMeta(page, limit, total) };
  },

  async findComment(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Comment.findById(id).populate("dishId", "name image price");
  },

  async updateComment(id: string, payload: Partial<{
    status: CommentStatus;
    isFeatured: boolean;
    isPinned: boolean;
    moderationReason: string;
  }>) {
    return Comment.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate("dishId", "name image price");
  },

  async deleteComment(id: string) {
    const comment = await Comment.findByIdAndDelete(id);
    if (comment) {
      await Like.deleteMany({ targetType: "COMMENT", targetId: comment._id });
    }
    return comment;
  },

  async toggleLike(payload: {
    targetType: LikeTargetType;
    targetId: string;
    guestId: string;
    kind: LikeKind;
    dishId?: string;
  }) {
    const filter = {
      targetType: payload.targetType,
      targetId: asObjectId(payload.targetId),
      guestId: payload.guestId,
      kind: payload.kind,
    };

    const existing = await Like.findOne(filter);
    if (existing) {
      await existing.deleteOne();
      return { active: false };
    }

    await Like.create({
      ...filter,
      dishId: payload.dishId ? asObjectId(payload.dishId) : undefined,
    });
    return { active: true };
  },

  async syncCommentLikeCount(commentId: string) {
    const count = await Like.countDocuments({
      targetType: "COMMENT",
      targetId: asObjectId(commentId),
      kind: "LIKE",
    });
    return Comment.findByIdAndUpdate(commentId, { likeCount: count }, { new: true });
  },

  async getGuestActions(guestId: string) {
    const likes = await Like.find({ guestId }).select("targetType targetId kind");
    return likes.map((like) => ({
      targetType: like.targetType,
      targetId: like.targetId.toString(),
      kind: like.kind,
    }));
  },

  async calculateRankings(limit = 8) {
    const weekStart = getStartOfDay(7);
    const monthStart = getStartOfDay(30);

    const [commentGroups, likeGroups, weeklyGroups, monthlyGroups] = await Promise.all([
      Comment.aggregate<{ _id: Types.ObjectId; count: number }>([
        { $match: { status: "VISIBLE" } },
        { $group: { _id: "$dishId", count: { $sum: 1 } } },
      ]),
      Like.aggregate<{ _id: { dishId: Types.ObjectId; kind: LikeKind }; count: number }>([
        { $match: { targetType: "DISH" } },
        { $group: { _id: { dishId: "$targetId", kind: "$kind" }, count: { $sum: 1 } } },
      ]),
      Like.aggregate<{ _id: Types.ObjectId; count: number }>([
        { $match: { targetType: "DISH", kind: "RECOMMENDATION", createdAt: { $gte: weekStart } } },
        { $group: { _id: "$targetId", count: { $sum: 1 } } },
      ]),
      Like.aggregate<{ _id: Types.ObjectId; count: number }>([
        { $match: { targetType: "DISH", kind: "RECOMMENDATION", createdAt: { $gte: monthStart } } },
        { $group: { _id: "$targetId", count: { $sum: 1 } } },
      ]),
    ]);

    const rankings = new Map<string, RankingRow>();
    const getRow = (dishId: Types.ObjectId | string) => {
      const id = dishId.toString();
      const existing = rankings.get(id);
      if (existing) return existing;
      const created: RankingRow = {
        dishId: id,
        commentCount: 0,
        recommendationCount: 0,
        likeCount: 0,
        weeklyRecommendations: 0,
        monthlyRecommendations: 0,
        score: 0,
      };
      rankings.set(id, created);
      return created;
    };

    commentGroups.forEach((item) => {
      getRow(item._id).commentCount = item.count;
    });

    likeGroups.forEach((item) => {
      const row = getRow(item._id.dishId);
      if (item._id.kind === "LIKE") row.likeCount = item.count;
      if (item._id.kind === "RECOMMENDATION") row.recommendationCount = item.count;
    });

    weeklyGroups.forEach((item) => {
      getRow(item._id).weeklyRecommendations = item.count;
    });

    monthlyGroups.forEach((item) => {
      getRow(item._id).monthlyRecommendations = item.count;
    });

    const rows = Array.from(rankings.values()).map((row) => ({
      ...row,
      score:
        row.commentCount +
        row.likeCount * 2 +
        row.recommendationCount * 3 +
        row.weeklyRecommendations * 2,
    }));

    const maxComments = Math.max(0, ...rows.map((row) => row.commentCount));
    const maxRecommendations = Math.max(0, ...rows.map((row) => row.recommendationCount));
    const maxLikes = Math.max(0, ...rows.map((row) => row.likeCount));
    const maxScore = Math.max(0, ...rows.map((row) => row.score));

    const dishIds = rows.map((row) => row.dishId);
    const dishes = await Dish.find({ _id: { $in: dishIds }, isAvailable: true })
      .populate("categoryId", "name order isActive")
      .select("name description price image categoryId isAvailable isFeatured order tags");

    const dishMap = new Map(
      dishes.map((dish) => {
        const item = dish.toObject({ virtuals: true });
        return [
          dish._id.toString(),
          {
            ...item,
            id: dish._id.toString(),
            imageUrl: resolveImageUrl(dish.image),
          },
        ];
      }),
    );

    const enriched = rows
      .filter((row) => dishMap.has(row.dishId))
      .map((row) => {
        const tags: string[] = [];
        if (row.commentCount > 0 && row.commentCount === maxComments) tags.push("Mas pedido");
        if (row.recommendationCount > 0 && row.recommendationCount === maxRecommendations) {
          tags.push("Mas recomendado");
        }
        if (row.likeCount > 0 && row.likeCount === maxLikes) tags.push("Favorito de clientes");
        if (row.score > 0 && row.score === maxScore) tags.push("Plato estrella");
        if (row.weeklyRecommendations > 0) tags.push("Tendencia semanal");

        return {
          ...row,
          tags,
          dish: dishMap.get(row.dishId),
        };
      })
      .sort((a, b) => b.score - a.score || b.recommendationCount - a.recommendationCount)
      .slice(0, limit);

    await Promise.all(
      enriched.map((row) =>
        DishRanking.findOneAndUpdate(
          { dishId: row.dishId },
          {
            dishId: row.dishId,
            commentCount: row.commentCount,
            recommendationCount: row.recommendationCount,
            likeCount: row.likeCount,
            weeklyRecommendations: row.weeklyRecommendations,
            monthlyRecommendations: row.monthlyRecommendations,
            score: row.score,
            tags: row.tags,
            calculatedAt: new Date(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        ),
      ),
    );

    return enriched;
  },

  async analytics() {
    const [totalComments, totalLikes, totalRecommendations, recentComments, rankings] =
      await Promise.all([
        Comment.countDocuments(),
        Like.countDocuments({ kind: "LIKE" }),
        Like.countDocuments({ kind: "RECOMMENDATION" }),
        Comment.find()
          .populate("dishId", "name")
          .sort({ createdAt: -1 })
          .limit(8),
        this.calculateRankings(5),
      ]);

    const snapshot = {
      totalComments,
      totalLikes,
      totalRecommendations,
      recentComments,
      popularDishes: rankings,
      generatedAt: new Date(),
    };

    await AnalyticsSnapshot.create({ name: "community_dashboard", data: snapshot });
    return snapshot;
  },
};
