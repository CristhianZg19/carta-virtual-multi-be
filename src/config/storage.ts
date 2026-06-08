import { Storage, type StorageOptions } from "@google-cloud/storage";
import { env } from "./env";

const parseCredentials = (value?: string) => {
  if (!value) return undefined;

  const candidate = value.trim().startsWith("{")
    ? value
    : Buffer.from(value, "base64").toString("utf8");

  return JSON.parse(candidate) as StorageOptions["credentials"];
};

const credentials = parseCredentials(env.gcpCredentialsJson);

export const storage = new Storage({
  projectId: env.gcpProjectId || credentials?.project_id || undefined,
  credentials,
});
