import { isValidObjectId } from "mongoose";
import { LoginTrace, type ILoginTrace, type LoginTraceActorType } from "../models/loginTrace.model";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

interface LoginTracePayload {
  actorType: LoginTraceActorType;
  identifier: string;
  userId?: unknown;
  userName?: string;
  restaurantId?: unknown;
  restaurantName?: string;
  restaurantSlug?: string;
  success: boolean;
  failureReason?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
}

interface LoginTraceFilters {
  actorType?: LoginTraceActorType;
  success?: boolean;
  restaurantSlug?: string;
  limit?: number;
}

const serialize = (trace: ILoginTrace) => {
  return {
    id: trace._id.toString(),
    actorType: trace.actorType,
    identifier: trace.identifier,
    userId: trace.userId?.toString() ?? "",
    userName: trace.userName ?? "",
    restaurantId: trace.restaurantId?.toString() ?? "",
    restaurantName: trace.restaurantName ?? "",
    restaurantSlug: trace.restaurantSlug ?? "",
    success: trace.success,
    failureReason: trace.failureReason ?? "",
    ip: trace.ip ?? "",
    userAgent: trace.userAgent ?? "",
    method: trace.method ?? "",
    path: trace.path ?? "",
    createdAt: trace.createdAt,
  };
};

export const loginTraceService = {
  async record(payload: LoginTracePayload) {
    try {
      await LoginTrace.create({
        ...payload,
        identifier: payload.identifier.toLowerCase(),
      });
    } catch (error) {
      logger.warn("Unable to record login trace", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  async list(filters: LoginTraceFilters = {}) {
    const query: Record<string, unknown> = {};
    const limit = Math.min(Math.max(filters.limit ?? 80, 1), 200);

    if (filters.actorType) query.actorType = filters.actorType;
    if (typeof filters.success === "boolean") query.success = filters.success;
    if (filters.restaurantSlug) query.restaurantSlug = filters.restaurantSlug.toLowerCase();

    const traces = await LoginTrace.find(query).sort({ createdAt: -1 }).limit(limit);
    return traces.map((trace) => serialize(trace));
  },

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new AppError("Log de inicio de sesion invalido", 400);
    }

    const trace = await LoginTrace.findByIdAndDelete(id);
    if (!trace) {
      throw new AppError("Log de inicio de sesion no encontrado", 404);
    }

    return serialize(trace);
  },
};
