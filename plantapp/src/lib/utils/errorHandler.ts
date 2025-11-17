export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
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

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  url?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

const logError = (err: AppError, ctx?: string | ErrorContext) => {
  const contextStr = typeof ctx === 'string' ? ctx : JSON.stringify(ctx);
  console.error(JSON.stringify({
    level: 'error',
    timestamp: new Date().toISOString(),
    context: contextStr,
    name: err.name,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
  }, null, 2));
};

export async function handleError(
  error: unknown, 
  context?: string | ErrorContext
): Promise<void> {
  if (error instanceof AppError) {
    logError(error, context);
    throw error;
  }

  const wrappedError = new AppError(
    'INTERNAL_ERROR',
    error instanceof Error ? error.message : 'An unexpected error occurred',
    500,
    false
  );
  logError(wrappedError, context);
  throw wrappedError;
}

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