import * as appInsights from 'applicationinsights'

const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
if (connectionString) {
  appInsights
    .setup(connectionString)
    .setAutoCollectRequests(false)
    .setAutoCollectPerformance(false, false)
    .setAutoCollectExceptions(true) // Collect uncaught exceptions
    .setAutoCollectDependencies(false)
    .setAutoCollectConsole(true) // Collect console.error/warn
    .setAutoCollectPreAggregatedMetrics(false)
    .setAutoDependencyCorrelation(false)
    .setUseDiskRetryCaching(false)
    .start()
}

/**
 * Track an exception to Application Insights
 */
export function trackException(
  error: Error | unknown,
  properties?: Record<string, string>
) {
  const client = appInsights.defaultClient
  if (client) {
    const exception = error instanceof Error ? error : new Error(String(error))
    client.trackException({
      exception,
      properties,
    })
    // Flush immediately to ensure it's sent before the function terminates
    client.flush()
  }
  // Always log to console as fallback
  console.error('Exception tracked:', error, properties)
}

/**
 * Track a custom event to Application Insights
 */
export function trackEvent(
  name: string,
  properties?: Record<string, string>
) {
  const client = appInsights.defaultClient
  if (client) {
    client.trackEvent({ name, properties })
  }
}
