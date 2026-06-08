import { tableService } from "../services/table.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const listTables = asyncHandler(async (_req, res) => {
  const tables = await tableService.list();
  return sendSuccess(res, 200, "Mesas obtenidas", tables);
});

export const createTable = asyncHandler(async (req, res) => {
  const table = await tableService.create(req.body);
  return sendSuccess(res, 201, "Mesa creada", table);
});

export const updateTable = asyncHandler(async (req, res) => {
  const table = await tableService.update(req.params.id, req.body);
  return sendSuccess(res, 200, "Mesa actualizada", table);
});

export const deleteTable = asyncHandler(async (req, res) => {
  const table = await tableService.remove(req.params.id);
  return sendSuccess(res, 200, "Mesa eliminada", table);
});

export const getTableQr = asyncHandler(async (req, res) => {
  const qr = await tableService.getQr(req.params.id);
  return sendSuccess(res, 200, "QR generado", qr);
});
