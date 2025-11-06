import PostHog from 'posthog-node';

const posthog = new PostHog(
  process.env.POSTHOG_API_KEY || 'your-api-key',
  {
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  }
);

// Initialize PostHog only if API key is provided
if (process.env.POSTHOG_API_KEY) {
  posthog.capture({
    distinctId: 'system',
    event: 'app_started',
    properties: {
      environment: process.env.NODE_ENV || 'development',
    },
  });
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

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public context?: ErrorContext;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = async (
  error: Error | AppError,
  context?: ErrorContext
): Promise<void> => {
  const errorContext = {
    ...context,
    ...(error instanceof AppError ? error.context : {}),
  };

  // Log to PostHog
  try {
    await posthog.capture({
      distinctId: errorContext.userId || 'anonymous',
      event: 'error_occurred',
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        status_code: error instanceof AppError ? error.statusCode : 500,
        is_operational: error instanceof AppError ? error.isOperational : false,
        ...errorContext,
      },
    });
  } catch (logError) {
    console.error('Failed to log error to PostHog:', logError);
  }

  // Also log to console for development
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    context: errorContext,
  });
};

export const createErrorHandler = (context?: ErrorContext) => {
  return (error: Error | AppError) => {
    return handleError(error, context);
  };
};

// Helper function to create operational errors
export const createOperationalError = (
  message: string,
  statusCode: number = 500,
  context?: ErrorContext
): AppError => {
  return new AppError(message, statusCode, true, context);
};

// Helper function to create programming errors (non-operational)
export const createProgrammingError = (
  message: string,
  context?: ErrorContext
): AppError => {
  return new AppError(message, 500, false, context);
};

// Logging utility for easy additions
export const logEvent = async (
  eventName: string,
  properties: Record<string, any>,
  userId?: string
): Promise<void> => {
  try {
    await posthog.capture({
      distinctId: userId || 'anonymous',
      event: eventName,
      properties,
    });
  } catch (error) {
    console.error('Failed to log event to PostHog:', error);
  }
};

// Helper function to log user actions
export const logUserAction = async (
  action: string,
  userId: string,
  properties: Record<string, any> = {}
): Promise<void> => {
  await logEvent(`user_${action}`, {
    ...properties,
    timestamp: new Date().toISOString(),
  }, userId);
};

// Helper function to log performance metrics
export const logPerformance = async (
  metric: string,
  value: number,
  properties: Record<string, any> = {}
): Promise<void> => {
  await logEvent('performance_metric', {
    metric,
    value,
    ...properties,
  });
};