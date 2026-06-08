import { uploadService } from "../services/upload.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadDishImage = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadDishImage(req.file);
  return sendSuccess(res, 201, "Imagen subida", result);
});
