import crypto from "crypto";
import slugify from "slugify";
import { DiningTable } from "../models/table.model";
import { AppError } from "../utils/errors";
import { buildPublicMenuUrl, createQrDataUrl } from "../utils/qr";

const makeCode = (name: string) => {
  const base = slugify(name, { lower: false, strict: true }).toUpperCase() || "MESA";
  return `${base}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
};

export const tableService = {
  async list() {
    return DiningTable.find().sort({ name: 1 });
  },

  async create(payload: { name: string; code?: string; isActive?: boolean }) {
    const code = payload.code?.toUpperCase() ?? makeCode(payload.name);
    const qrUrl = buildPublicMenuUrl(code);
    return DiningTable.create({ ...payload, code, qrUrl });
  },

  async update(id: string, payload: { name?: string; code?: string; isActive?: boolean }) {
    const nextPayload = { ...payload };
    if (nextPayload.code) {
      nextPayload.code = nextPayload.code.toUpperCase();
    }

    const code = nextPayload.code;
    const update = code ? { ...nextPayload, qrUrl: buildPublicMenuUrl(code) } : nextPayload;
    const table = await DiningTable.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!table) throw new AppError("Mesa no encontrada", 404);
    return table;
  },

  async remove(id: string) {
    const table = await DiningTable.findByIdAndDelete(id);
    if (!table) throw new AppError("Mesa no encontrada", 404);
    return table;
  },

  async getQr(id: string) {
    const table = await DiningTable.findById(id);
    if (!table) throw new AppError("Mesa no encontrada", 404);

    return {
      table,
      url: table.qrUrl,
      dataUrl: await createQrDataUrl(table.qrUrl),
    };
  },
};
