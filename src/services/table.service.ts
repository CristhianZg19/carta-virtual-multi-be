import crypto from "crypto";
import slugify from "slugify";
import { DiningTable } from "../models/table.model";
import type { RestaurantScope } from "../types/api";
import { AppError } from "../utils/errors";
import { buildPublicMenuUrl, createQrDataUrl } from "../utils/qr";

const makeCode = (name: string) => {
  const base = slugify(name, { lower: false, strict: true }).toUpperCase() || "MESA";
  return `${base}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
};

export const tableService = {
  async list(restaurantId: string) {
    return DiningTable.find({ restaurantId }).sort({ name: 1 });
  },

  async create(restaurant: RestaurantScope, payload: { name: string; code?: string; isActive?: boolean }) {
    const code = payload.code?.toUpperCase() ?? makeCode(payload.name);
    const qrUrl = buildPublicMenuUrl(restaurant.slug, code);
    return DiningTable.create({ ...payload, restaurantId: restaurant.id, code, qrUrl });
  },

  async update(
    restaurant: RestaurantScope,
    id: string,
    payload: { name?: string; code?: string; isActive?: boolean },
  ) {
    const nextPayload = { ...payload };
    if (nextPayload.code) {
      nextPayload.code = nextPayload.code.toUpperCase();
    }

    const code = nextPayload.code;
    const update = code ? { ...nextPayload, qrUrl: buildPublicMenuUrl(restaurant.slug, code) } : nextPayload;
    const table = await DiningTable.findOneAndUpdate({ _id: id, restaurantId: restaurant.id }, update, {
      new: true,
      runValidators: true,
    });

    if (!table) throw new AppError("Mesa no encontrada", 404);
    return table;
  },

  async remove(restaurantId: string, id: string) {
    const table = await DiningTable.findOneAndDelete({ _id: id, restaurantId });
    if (!table) throw new AppError("Mesa no encontrada", 404);
    return table;
  },

  async getQr(restaurantId: string, id: string) {
    const table = await DiningTable.findOne({ _id: id, restaurantId });
    if (!table) throw new AppError("Mesa no encontrada", 404);

    return {
      table,
      url: table.qrUrl,
      dataUrl: await createQrDataUrl(table.qrUrl),
    };
  },
};
