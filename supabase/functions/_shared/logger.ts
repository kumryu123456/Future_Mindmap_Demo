/**
 * Simple logger utility for Supabase Edge Functions
 */

export interface LogContext {
  [key: string]: any
}

export class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private formatMessage(level: string, message: string, data?: LogContext): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${this.context}] ${level.toUpperCase()}`
    
    if (data) {
      return `${prefix}: ${message} ${JSON.stringify(data)}`
    }
    return `${prefix}: ${message}`
  }

  info(message: string, data?: LogContext) {
    console.log(this.formatMessage('info', message, data))
  }

  warn(message: string, data?: LogContext) {
    console.warn(this.formatMessage('warn', message, data))
  }

  error(message: string, error?: Error | LogContext, data?: LogContext) {
    let errorData = data
    if (error instanceof Error) {
      errorData = { ...data, error: error.message, stack: error.stack }
    } else if (error) {
      errorData = { ...data, ...error }
    }
    console.error(this.formatMessage('error', message, errorData))
  }

  debug(message: string, data?: LogContext) {
    console.log(this.formatMessage('debug', message, data))
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context)
}