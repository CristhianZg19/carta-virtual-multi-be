import { uploadService } from "../services/upload.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadDishImage = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadDishImage(req.file);
  return sendSuccess(res, 201, "Imagen subida", result);
});

export const uploadRestaurantLogo = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadRestaurantLogo(req.file);
  return sendSuccess(res, 201, "Logo subido", result);
});
