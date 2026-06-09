import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { CreatorAdmin } from "../models/creatorAdmin.model";
import { AppError } from "../utils/errors";

interface CreatorTokenPayload extends jwt.JwtPayload {
  sub: string;
  type: "CREATOR_ADMIN";
}

export const authenticateCreator: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

    if (!token) {
      throw new AppError("No autenticado", 401);
    }

    const payload = jwt.verify(token, env.jwtSecret) as CreatorTokenPayload;
    if (payload.type !== "CREATOR_ADMIN") {
      throw new AppError("Token invalido", 401);
    }

    const creator = await CreatorAdmin.findById(payload.sub).select("_id isActive username");
    if (!creator || !creator.isActive) {
      throw new AppError("Usuario creador no autorizado", 401);
    }

    req.creatorAdmin = {
      id: creator._id.toString(),
      username: creator.username,
    };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Token invalido o expirado", 401));
  }
};
