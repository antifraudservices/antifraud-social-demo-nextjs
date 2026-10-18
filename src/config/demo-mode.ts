type DemoEnvironment = Readonly<Record<string, string | undefined>>

export function resolveSocialDemoMode(environment: DemoEnvironment = process.env): boolean {
  if (environment.ANTIFRAUD_SOCIAL_DEMO_MODE !== 'true') return false

  if (environment.NODE_ENV !== 'production') return true

  return environment.ANTIFRAUD_SOCIAL_DEPLOYMENT_STAGE === 'test'
    || environment.ANTIFRAUD_SOCIAL_DEPLOYMENT_STAGE === 'staging'
}
