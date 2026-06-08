import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/user.model";
import type { UserRole } from "../types/api";
import { AppError } from "../utils/errors";

interface TokenPayload extends jwt.JwtPayload {
  sub: string;
  role: UserRole;
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

    if (!token) {
      throw new AppError("No autenticado", 401);
    }

    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const user = await User.findById(payload.sub).select("_id role isActive");

    if (!user || !user.isActive) {
      throw new AppError("Usuario no autorizado", 401);
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Token invalido o expirado", 401));
  }
};

export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(new AppError("No autenticado", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("No tienes permisos para esta accion", 403));
      return;
    }

    next();
  };
