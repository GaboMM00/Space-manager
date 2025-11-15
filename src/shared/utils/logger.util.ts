/**
 * Utilidad de logging simple
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] [${this.context}] ${message}${dataStr}`;
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: any): void {
    console.info(this.formatMessage(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(this.formatMessage(LogLevel.ERROR, message, errorData));
  }

  setContext(context: string): void {
    this.context = context;
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}

export { Logger };
