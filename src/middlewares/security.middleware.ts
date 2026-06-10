import type { RequestHandler } from "express";
import { securityService, type SecurityRule } from "../services/security.service";
import { AppError } from "../utils/errors";

export const securityRateLimit =
  (rule: SecurityRule): RequestHandler =>
  async (req, _res, next) => {
    const context = securityService.contextFromRequest(req);

    try {
      const result = await securityService.evaluate(rule, context);

      if (!result.allowed) {
        await securityService.record({
          ...context,
          action: rule.action,
          status: "BLOCKED",
          severity: result.autoBlocked ? "CRITICAL" : "WARN",
          reason: result.reason,
          metadata: {
            scope: rule.scope,
            hits: result.hits,
            max: rule.max,
            windowMs: rule.windowMs,
            autoBlocked: result.autoBlocked ?? false,
            activeBlock: result.activeBlock,
          },
        });

        next(new AppError(result.reason ?? "Solicitud bloqueada por seguridad", 429));
        return;
      }

      await securityService.record({
        ...context,
        action: rule.action,
        status: "ALLOWED",
        severity: "INFO",
        reason: "Solicitud permitida",
        metadata: {
          scope: rule.scope,
          hits: result.hits,
          max: rule.max,
          windowMs: rule.windowMs,
        },
      });

      next();
    } catch (error) {
      next(error);
    }
  };
