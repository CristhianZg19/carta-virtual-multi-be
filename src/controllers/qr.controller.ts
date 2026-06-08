import { qrService } from "../services/qr.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const generateQr = asyncHandler(async (req, res) => {
  const qr = await qrService.generate(req.body);
  return sendSuccess(res, 200, "QR generado", qr);
});
