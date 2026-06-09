import type { Request } from "express";

const firstHeader = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

export const getRequestMeta = (req: Request) => {
  const forwardedFor = firstHeader(req.headers["x-forwarded-for"]);
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  const ip =
    firstHeader(req.headers["cf-connecting-ip"]) ||
    firstHeader(req.headers["x-real-ip"]) ||
    forwardedIp ||
    req.ip ||
    req.socket.remoteAddress ||
    "";

  return {
    ip: ip.replace(/^::ffff:/, ""),
    userAgent: req.get("user-agent") ?? "",
    method: req.method,
    path: req.originalUrl,
  };
};
