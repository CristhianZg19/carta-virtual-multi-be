import type { Response } from "express";
import type { ApiMeta } from "../types/api";

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: ApiMeta,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};
