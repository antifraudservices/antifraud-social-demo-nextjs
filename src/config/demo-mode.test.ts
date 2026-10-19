// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import { describe, expect, it } from 'vitest'
import { resolveSocialDemoMode } from './demo-mode'

describe('social demo mode boundary', () => {
  it('allows explicit local and staging simulation but fails closed elsewhere', () => {
    expect(resolveSocialDemoMode({ NODE_ENV: 'development', ANTIFRAUD_SOCIAL_DEMO_MODE: 'true' })).toBe(true)
    expect(resolveSocialDemoMode({
      NODE_ENV: 'production',
      ANTIFRAUD_SOCIAL_DEMO_MODE: 'true',
      ANTIFRAUD_SOCIAL_DEPLOYMENT_STAGE: 'test',
    })).toBe(true)
    expect(resolveSocialDemoMode({
      NODE_ENV: 'production',
      ANTIFRAUD_SOCIAL_DEMO_MODE: 'true',
      ANTIFRAUD_SOCIAL_DEPLOYMENT_STAGE: 'staging',
    })).toBe(true)
    expect(resolveSocialDemoMode({
      NODE_ENV: 'production',
      ANTIFRAUD_SOCIAL_DEMO_MODE: 'true',
      ANTIFRAUD_SOCIAL_DEPLOYMENT_STAGE: 'beta',
    })).toBe(true)
    expect(resolveSocialDemoMode({
      NODE_ENV: 'production',
      ANTIFRAUD_SOCIAL_DEMO_MODE: 'true',
      ANTIFRAUD_SOCIAL_DEPLOYMENT_STAGE: 'test-network',
    })).toBe(false)
    expect(resolveSocialDemoMode({ NODE_ENV: 'development' })).toBe(false)
  })
})
