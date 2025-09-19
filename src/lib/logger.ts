/** biome-ignore-all lint/suspicious/noConsole: This is a logger */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, location: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${location}] ${level.toUpperCase()}: <${message}>${contextStr}`;
  }

  debug(location: string, message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', location, message, context));
    }
  }

  info(location: string, message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', location, message, context));
  }

  warn(location: string, message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', location, message, context));
  }

  error(location: string, message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', location, message, context));
  }
}

export const logger = new Logger();
