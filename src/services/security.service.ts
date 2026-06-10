import type { Request } from "express";
import { Types } from "mongoose";
import { BlockedIp, type BlockedIpSource, type IBlockedIp } from "../models/blockedIp.model";
import {
  SecurityEvent,
  type ISecurityEvent,
  type SecurityAction,
  type SecurityActorType,
  type SecurityEventSeverity,
  type SecurityEventStatus,
} from "../models/securityEvent.model";
import { logger } from "../utils/logger";
import { getRequestMeta } from "../utils/requestMeta";

export type SecurityRateLimitScope = "IP" | "IP_RESTAURANT" | "USER_RESTAURANT" | "RESTAURANT";

export interface SecurityRequestContext {
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  restaurantId?: string;
  restaurantName?: string;
  restaurantSlug?: string;
  actorType: SecurityActorType;
  actorId?: string;
  actorName?: string;
}

export interface SecurityRule {
  action: SecurityAction;
  scope: SecurityRateLimitScope;
  max: number;
  windowMs: number;
  autoBlockAfter?: number;
  autoBlockMs?: number;
}

interface EvaluateResult {
  allowed: boolean;
  reason?: string;
  hits: number;
  activeBlock?: ReturnType<typeof serializeBlockedIp>;
  autoBlocked?: boolean;
}

interface SecurityEventPayload extends SecurityRequestContext {
  action: SecurityAction;
  status: SecurityEventStatus;
  severity?: SecurityEventSeverity;
  reason?: string;
  metadata?: Record<string, unknown>;
}

interface SecurityEventFilters {
  action?: SecurityAction;
  status?: SecurityEventStatus;
  restaurantSlug?: string;
  ip?: string;
  limit?: number;
}

interface BlockedIpFilters {
  active?: boolean;
  limit?: number;
}

const toObjectId = (value?: string) => (value && Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : undefined);

const serializeEvent = (event: ISecurityEvent) => ({
  id: event._id.toString(),
  action: event.action,
  status: event.status,
  severity: event.severity,
  reason: event.reason ?? "",
  ip: event.ip ?? "",
  userAgent: event.userAgent ?? "",
  method: event.method ?? "",
  path: event.path ?? "",
  restaurantId: event.restaurantId?.toString() ?? "",
  restaurantName: event.restaurantName ?? "",
  restaurantSlug: event.restaurantSlug ?? "",
  actorType: event.actorType,
  actorId: event.actorId?.toString() ?? "",
  actorName: event.actorName ?? "",
  metadata: event.metadata ?? {},
  createdAt: event.createdAt,
});

const serializeBlockedIp = (blockedIp: IBlockedIp) => ({
  id: blockedIp._id.toString(),
  ip: blockedIp.ip,
  reason: blockedIp.reason ?? "",
  source: blockedIp.source,
  isActive: blockedIp.isActive,
  blockedUntil: blockedIp.blockedUntil,
  blockedBy: blockedIp.blockedBy ?? "",
  unblockedBy: blockedIp.unblockedBy ?? "",
  unblockedAt: blockedIp.unblockedAt,
  createdAt: blockedIp.createdAt,
  updatedAt: blockedIp.updatedAt,
});

const activeBlockedIpQuery = (ip: string) => ({
  ip,
  isActive: true,
  $or: [{ blockedUntil: null }, { blockedUntil: { $exists: false } }, { blockedUntil: { $gt: new Date() } }],
});

const buildScopeQuery = (rule: SecurityRule, context: SecurityRequestContext, since: Date) => {
  const query: Record<string, unknown> = {
    action: rule.action,
    createdAt: { $gte: since },
  };

  if (rule.scope === "IP" || rule.scope === "IP_RESTAURANT") {
    query.ip = context.ip;
  }

  if (rule.scope === "IP_RESTAURANT" || rule.scope === "USER_RESTAURANT" || rule.scope === "RESTAURANT") {
    if (context.restaurantId) {
      query.restaurantId = context.restaurantId;
    } else if (context.restaurantSlug) {
      query.restaurantSlug = context.restaurantSlug;
    }
  }

  if (rule.scope === "USER_RESTAURANT") {
    if (context.actorId) {
      query.actorId = context.actorId;
    } else {
      query.ip = context.ip;
    }
  }

  return query;
};

export const securityService = {
  contextFromRequest(req: Request): SecurityRequestContext {
    const meta = getRequestMeta(req);
    const actorType: SecurityActorType = req.creatorAdmin
      ? "CREATOR_ADMIN"
      : req.user
        ? "BUSINESS_ADMIN"
        : "GUEST";

    return {
      ip: meta.ip,
      userAgent: meta.userAgent,
      method: meta.method,
      path: meta.path,
      restaurantId: req.restaurant?.id,
      restaurantName: req.restaurant?.name,
      restaurantSlug: req.restaurant?.slug,
      actorType,
      actorId: req.user?.id ?? req.creatorAdmin?.id,
      actorName: req.creatorAdmin?.username ?? req.user?.role,
    };
  },

  async record(payload: SecurityEventPayload) {
    try {
      await SecurityEvent.create({
        action: payload.action,
        status: payload.status,
        severity: payload.severity ?? (payload.status === "BLOCKED" ? "WARN" : "INFO"),
        reason: payload.reason ?? "",
        ip: payload.ip,
        userAgent: payload.userAgent,
        method: payload.method,
        path: payload.path,
        restaurantId: toObjectId(payload.restaurantId),
        restaurantName: payload.restaurantName ?? "",
        restaurantSlug: payload.restaurantSlug ?? "",
        actorType: payload.actorType,
        actorId: toObjectId(payload.actorId),
        actorName: payload.actorName ?? "",
        metadata: payload.metadata ?? {},
      });
    } catch (error) {
      logger.warn("Unable to record security event", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  async evaluate(rule: SecurityRule, context: SecurityRequestContext): Promise<EvaluateResult> {
    if (!context.ip) {
      return { allowed: true, hits: 0 };
    }

    const activeBlock = await BlockedIp.findOne(activeBlockedIpQuery(context.ip)).sort({ createdAt: -1 });
    if (activeBlock) {
      return {
        allowed: false,
        hits: 0,
        reason: activeBlock.reason || "IP bloqueada por seguridad",
        activeBlock: serializeBlockedIp(activeBlock),
      };
    }

    const since = new Date(Date.now() - rule.windowMs);
    const scopedQuery = buildScopeQuery(rule, context, since);
    const hits = await SecurityEvent.countDocuments(scopedQuery);
    const nextHits = hits + 1;

    if (hits < rule.max) {
      return { allowed: true, hits: nextHits };
    }

    const shouldAutoBlock = Boolean(rule.autoBlockAfter && nextHits >= rule.autoBlockAfter);
    if (shouldAutoBlock) {
      await this.blockIp({
        ip: context.ip,
        reason: `Bloqueo automatico por exceso de ${rule.action}`,
        source: "AUTO",
        blockedUntil: new Date(Date.now() + (rule.autoBlockMs ?? 60 * 60 * 1000)),
        blockedBy: "system",
      });
    }

    return {
      allowed: false,
      hits: nextHits,
      autoBlocked: shouldAutoBlock,
      reason: shouldAutoBlock
        ? "Demasiadas solicitudes. IP bloqueada temporalmente."
        : "Demasiadas solicitudes. Intenta nuevamente mas tarde.",
    };
  },

  async listEvents(filters: SecurityEventFilters = {}) {
    const query: Record<string, unknown> = {};
    const limit = Math.min(Math.max(filters.limit ?? 80, 1), 200);

    if (filters.action) query.action = filters.action;
    if (filters.status) query.status = filters.status;
    if (filters.restaurantSlug) query.restaurantSlug = filters.restaurantSlug.toLowerCase();
    if (filters.ip) query.ip = filters.ip;

    const events = await SecurityEvent.find(query).sort({ createdAt: -1 }).limit(limit);
    return events.map((event) => serializeEvent(event));
  },

  async listBlockedIps(filters: BlockedIpFilters = {}) {
    const query: Record<string, unknown> = {};
    const limit = Math.min(Math.max(filters.limit ?? 80, 1), 200);

    if (typeof filters.active === "boolean") {
      query.isActive = filters.active;
      if (filters.active) {
        query.$or = [
          { blockedUntil: null },
          { blockedUntil: { $exists: false } },
          { blockedUntil: { $gt: new Date() } },
        ];
      }
    }

    const blockedIps = await BlockedIp.find(query).sort({ createdAt: -1 }).limit(limit);
    return blockedIps.map((item) => serializeBlockedIp(item));
  },

  async blockIp(payload: {
    ip: string;
    reason?: string;
    source?: BlockedIpSource;
    blockedUntil?: Date | null;
    blockedBy?: string;
  }) {
    const existing = await BlockedIp.findOne(activeBlockedIpQuery(payload.ip)).sort({ createdAt: -1 });
    if (existing) {
      existing.reason = payload.reason ?? existing.reason;
      existing.source = payload.source ?? existing.source;
      existing.blockedUntil = payload.blockedUntil ?? existing.blockedUntil;
      existing.blockedBy = payload.blockedBy ?? existing.blockedBy;
      await existing.save();
      return serializeBlockedIp(existing);
    }

    const blockedIp = await BlockedIp.create({
      ip: payload.ip,
      reason: payload.reason ?? "",
      source: payload.source ?? "MANUAL",
      blockedUntil: payload.blockedUntil ?? null,
      blockedBy: payload.blockedBy ?? "",
      isActive: true,
    });

    return serializeBlockedIp(blockedIp);
  },

  async unblockIp(id: string, unblockedBy?: string) {
    const blockedIp = await BlockedIp.findByIdAndUpdate(
      id,
      { isActive: false, unblockedBy: unblockedBy ?? "", unblockedAt: new Date() },
      { new: true, runValidators: true },
    );

    return blockedIp ? serializeBlockedIp(blockedIp) : null;
  },
};
