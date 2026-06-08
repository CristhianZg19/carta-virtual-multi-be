import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env";
import { AppError } from "../utils/errors";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = error instanceof AppError ? error.statusCode : 500;
  let message = error.message || "Error interno del servidor";
  let details = error instanceof AppError ? error.details : undefined;

  if (error instanceof ZodError) {
    statusCode = 422;
    message = "Datos de entrada no validos";
    details = error.flatten();
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Identificador invalido";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "Ya existe un registro con esos datos";
    details = error.keyValue;
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: isProduction ? undefined : error.stack,
  });
};
