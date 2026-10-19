import type { PortalEnvironment } from 'antifraud-portal-components-react'

export type SocialEnvironment = Readonly<{
  active: PortalEnvironment
  testNetworkEnabled: boolean
  productionEnabled: boolean
}>

export function readSocialEnvironment(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): SocialEnvironment {
  const active = environment.ANTIFRAUD_NETWORK_KIND ?? 'demo'
  const testNetworkEnabled = environment.ANTIFRAUD_TEST_NETWORK_ENABLED === 'true'
  const productionEnabled = environment.ANTIFRAUD_PRODUCTION_ENABLED === 'true'

  if (active === 'demo' || active === 'test') {
    return {active: 'demo', testNetworkEnabled, productionEnabled}
  }
  if (active === 'test-network' && testNetworkEnabled) {
    return {active, testNetworkEnabled, productionEnabled}
  }
  if ((active === 'production' || active === 'network') && productionEnabled) {
    return {active: 'production', testNetworkEnabled, productionEnabled}
  }
  throw new Error(`${active} is disabled by trusted server configuration.`)
}
