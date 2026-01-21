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
