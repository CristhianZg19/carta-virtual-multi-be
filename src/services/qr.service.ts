import { DiningTable } from "../models/table.model";
import { AppError } from "../utils/errors";
import { buildPublicMenuUrl, createQrDataUrl } from "../utils/qr";

interface GenerateQrPayload {
  targetUrl?: string;
  tableId?: string;
  tableCode?: string;
}

export const qrService = {
  async generate(payload: GenerateQrPayload) {
    let url = payload.targetUrl;
    let table = null;

    if (payload.tableId) {
      table = await DiningTable.findById(payload.tableId);
      if (!table) throw new AppError("Mesa no encontrada", 404);
      url = table.qrUrl;
    }

    if (!url) {
      url = buildPublicMenuUrl(payload.tableCode);
    }

    return {
      url,
      table,
      dataUrl: await createQrDataUrl(url),
    };
  },
};
