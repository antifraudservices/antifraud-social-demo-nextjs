// Flow contract: trusted server configuration selects Demo, Test Network, or Production; browser-visible variables never grant access to a disabled environment.
import { describe, expect, it } from 'vitest'
import { readSocialEnvironment } from './environment'

describe('readSocialEnvironment', () => {
  it('defaults to Demo with Test Network and Production disabled', () => {
    expect(readSocialEnvironment({})).toEqual({
      active: 'demo',
      testNetworkEnabled: false,
      productionEnabled: false,
    })
  })

  it('permits Test Network only when the trusted server flag enables it', () => {
    expect(readSocialEnvironment({
      ANTIFRAUD_NETWORK_KIND: 'test-network',
      ANTIFRAUD_TEST_NETWORK_ENABLED: 'true',
    })).toEqual({active: 'test-network', testNetworkEnabled: true, productionEnabled: false})
    expect(() => readSocialEnvironment({ANTIFRAUD_NETWORK_KIND: 'test-network'})).toThrow(/disabled/)
  })

  it('does not treat NEXT_PUBLIC flags as authority', () => {
    expect(() => readSocialEnvironment({
      ANTIFRAUD_NETWORK_KIND: 'test-network',
      NEXT_PUBLIC_ANTIFRAUD_TEST_NETWORK_ENABLED: 'true',
    })).toThrow(/disabled/)
  })

  it('keeps Production disabled unless its private server flag is present', () => {
    expect(() => readSocialEnvironment({ANTIFRAUD_NETWORK_KIND: 'production'})).toThrow(/disabled/)
  })
})
