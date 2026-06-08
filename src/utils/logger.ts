type LogLevel = "info" | "warn" | "error";
type LogFields = Record<string, unknown>;

const shouldUseJson = process.env.LOG_FORMAT === "json";

const serializeError = (error: unknown): LogFields => {
  if (!(error instanceof Error)) {
    return { value: String(error) };
  }

  const fields: LogFields = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  const withCode = error as Error & { code?: unknown; reason?: unknown };
  if (withCode.code) fields.code = withCode.code;
  if (withCode.reason) fields.reason = String(withCode.reason);

  return fields;
};

const write = (level: LogLevel, message: string, fields: LogFields = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };

  if (shouldUseJson) {
    const line = JSON.stringify(payload);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
    return;
  }

  const extras = Object.keys(fields).length ? ` ${JSON.stringify(fields)}` : "";
  const line = `[${payload.timestamp}] ${level.toUpperCase()} ${message}${extras}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export const logger = {
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, error?: unknown, fields: LogFields = {}) =>
    write("error", message, {
      ...fields,
      error: error ? serializeError(error) : undefined,
    }),
};

export const redactConnectionString = (value: string) =>
  value.replace(/(mongodb(?:\+srv)?:\/\/)([^:/?#]+):([^@]+)@/i, "$1$2:***@");
