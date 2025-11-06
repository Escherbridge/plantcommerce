/**
 * Centralized error handling utilities for Aevani.
 * Designed for minimal code duplication and easy logging integration.
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Centralized error handler with logging placeholder.
 * Wraps errors in AppError for consistency and future logging integration.
 */
export function handleError(error: unknown, context?: string): never {
  // Centralized logger
  const logError = (err: any, context?: string) => {
    const logEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      context,
      name: err.name,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      stack: err.stack,
    };
    console.error(JSON.stringify(logEntry, null, 2));
  };

  if (error instanceof AppError) {
    logError(error, context);
    throw error;
  }

  // Wrap unexpected errors
  const wrappedError = new AppError(
    'INTERNAL_ERROR',
    error instanceof Error ? error.message : 'An unexpected error occurred',
    500,
    false
  );
  logError(wrappedError, context);
  throw wrappedError;
}

/**
 * Async wrapper for try-catch with error handling.
 * Reduces boilerplate in service methods.
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleError(error, context);
  }
}