/**
 * Simple metrics tracking utility for Supabase Edge Functions
 */

export interface MetricData {
  [key: string]: any
}

export interface PerformanceMetric {
  name: string
  duration: number
  metadata?: MetricData
}

class Metrics {
  private events: Array<{
    type: string
    value: number
    metadata?: MetricData
    timestamp: number
  }> = []

  recordBusinessEvent(type: string, value: number, metadata?: MetricData) {
    this.events.push({
      type,
      value,
      metadata,
      timestamp: Date.now()
    })
    
    console.log(`[METRIC] ${type}: ${value}`, metadata)
  }

  recordPerformance(metric: PerformanceMetric) {
    this.recordBusinessEvent('performance', metric.duration, {
      name: metric.name,
      ...metric.metadata
    })
  }

  getEvents() {
    return [...this.events]
  }

  clearEvents() {
    this.events.length = 0
  }
}

export const metrics = new Metrics()

export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: MetricData
): Promise<T> {
  const startTime = Date.now()
  
  try {
    const result = await fn()
    const duration = Date.now() - startTime
    
    metrics.recordPerformance({
      name,
      duration,
      metadata: { ...metadata, success: true }
    })
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    
    metrics.recordPerformance({
      name,
      duration,
      metadata: { ...metadata, success: false, error: error instanceof Error ? error.message : String(error) }
    })
    
    throw error
  }
}

export async function withMetrics<T>(
  req: Request,
  handler: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  const method = req.method
  const url = req.url
  
  try {
    const result = await handler()
    const duration = Date.now() - startTime
    
    metrics.recordBusinessEvent('request', 1, {
      method,
      url,
      duration,
      success: true
    })
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    
    metrics.recordBusinessEvent('request', 1, {
      method,
      url,
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    })
    
    throw error
  }
}