export type DomainErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "DOMAIN_ERROR";

export interface DomainErrorDetails {
  [key: string]: unknown;
}

export class DomainError extends Error {
  public readonly code: DomainErrorCode;
  public readonly details?: DomainErrorDetails;
  public readonly cause?: unknown;

  constructor(
    message: string,
    code: DomainErrorCode = "DOMAIN_ERROR",
    details?: DomainErrorDetails,
    cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.cause = cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestException extends DomainError {
  constructor(
    message = "Bad request",
    details?: DomainErrorDetails,
    cause?: unknown,
  ) {
    super(message, "BAD_REQUEST", details, cause);
  }
}

export class NotFoundException extends DomainError {
  constructor(
    message = "Not found",
    details?: DomainErrorDetails,
    cause?: unknown,
  ) {
    super(message, "NOT_FOUND", details, cause);
  }
}

export class ConflictException extends DomainError {
  constructor(
    message = "Conflict",
    details?: DomainErrorDetails,
    cause?: unknown,
  ) {
    super(message, "CONFLICT", details, cause);
  }
}

export class ForbiddenException extends DomainError {
  constructor(
    message = "Forbidden",
    details?: DomainErrorDetails,
    cause?: unknown,
  ) {
    super(message, "FORBIDDEN", details, cause);
  }
}

export class UnauthorizedException extends DomainError {
  constructor(
    message = "Unauthorized",
    details?: DomainErrorDetails,
    cause?: unknown,
  ) {
    super(message, "UNAUTHORIZED", details, cause);
  }
}

export const isDomainError = (e: unknown): e is DomainError =>
  !!e && typeof e === "object" && "name" in e && "code" in e;
