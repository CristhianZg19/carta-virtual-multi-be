import { model, Schema, Types, type Document } from "mongoose";

export interface IDishRanking extends Document {
  restaurantId: Types.ObjectId;
  dishId: Types.ObjectId;
  commentCount: number;
  recommendationCount: number;
  likeCount: number;
  weeklyRecommendations: number;
  monthlyRecommendations: number;
  score: number;
  tags: string[];
  calculatedAt: Date;
}

const dishRankingSchema = new Schema<IDishRanking>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    dishId: { type: Schema.Types.ObjectId, ref: "Dish", required: true, index: true },
    commentCount: { type: Number, default: 0 },
    recommendationCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    weeklyRecommendations: { type: Number, default: 0 },
    monthlyRecommendations: { type: Number, default: 0 },
    score: { type: Number, default: 0, index: true },
    tags: [{ type: String, trim: true }],
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

dishRankingSchema.index({ restaurantId: 1, dishId: 1 }, { unique: true });
dishRankingSchema.index({ restaurantId: 1, score: -1 });

export const DishRanking = model<IDishRanking>("DishRanking", dishRankingSchema, "dish_rankings");
