import QRCode from "qrcode";
import { env } from "../config/env";

export const buildPublicMenuUrl = (tableCode?: string) => {
  const url = new URL(env.publicMenuUrl);
  if (tableCode) {
    url.searchParams.set("table", tableCode);
  }
  return url.toString();
};

export const createQrDataUrl = (targetUrl: string) =>
  QRCode.toDataURL(targetUrl, {
    type: "image/png",
    margin: 2,
    width: 720,
    color: {
      dark: "#14211b",
      light: "#ffffff",
    },
  });
