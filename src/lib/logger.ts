/**
 * 로깅 유틸리티
 *
 * 프로덕션 환경에서는 console.log 제외, error/warn만 출력
 * 개발 환경에서는 모든 레벨 출력
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogOptions {
  context?: string;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 프로덕션에서는 warn 이상만 출력
const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "warn" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatMessage(
  level: LogLevel,
  message: string,
  options?: LogOptions
): string {
  const timestamp = new Date().toISOString();
  const context = options?.context ? `[${options.context}]` : "";
  return `${timestamp} [${level.toUpperCase()}]${context} ${message}`;
}

/**
 * Debug 레벨 로깅 (개발 환경에서만)
 */
export function logDebug(message: string, options?: LogOptions): void {
  if (!shouldLog("debug")) return;
  const formatted = formatMessage("debug", message, options);
  console.log(formatted, options?.data ?? "");
}

/**
 * Info 레벨 로깅 (개발 환경에서만)
 */
export function logInfo(message: string, options?: LogOptions): void {
  if (!shouldLog("info")) return;
  const formatted = formatMessage("info", message, options);
  console.info(formatted, options?.data ?? "");
}

/**
 * Warn 레벨 로깅
 */
export function logWarn(message: string, options?: LogOptions): void {
  if (!shouldLog("warn")) return;
  const formatted = formatMessage("warn", message, options);
  console.warn(formatted, options?.data ?? "");
}

/**
 * Error 레벨 로깅
 */
export function logError(message: string, options?: LogOptions): void {
  if (!shouldLog("error")) return;
  const formatted = formatMessage("error", message, options);
  console.error(formatted, options?.data ?? "");
}

/**
 * 에러 객체 로깅 헬퍼
 */
export function logException(
  error: unknown,
  context?: string
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logError(message, {
    context,
    data: {
      name: error instanceof Error ? error.name : "UnknownError",
      stack,
    },
  });
}

// 기본 export (logger 객체)
export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  exception: logException,
};

export default logger;
