// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import { describe, expect, it } from 'vitest'
import { createDemoSigningStore } from './demo-signing-store'

describe('managed-wallet Demo signing demonstration', () => {
  it('persists a bound request, verified proof and clearly simulated ledger receipt', async () => {
    const gatewayCalls: string[] = []
    let gatewayRecord: any
    const store = createDemoSigningStore({
      delayMs: 0,
      now: () => new Date('2026-10-18T12:00:00.000Z'),
      gateway: {
        async recordSocialPublication(input) {
          gatewayCalls.push('record')
          gatewayRecord = {
            id: input.proof.requestId, environment: 'demo', status: 'demo-recorded',
            content: input.content, proof: input.proof,
            receipt: {
              adapter: 'in-memory-fabric-demo', transactionId: 'demo-memory-authoritative',
              recordedAt: '2026-10-18T12:00:00.000Z', cryptographicProof: true,
            },
          }
          return gatewayRecord
        },
        async readSocialPublication() {
          gatewayCalls.push('read')
          return gatewayRecord
        },
      },
    })
    const request = await store.createRequest({
      caption: 'Field notes from the open learning lab.',
      mediaId: 'synthetic-coastline-001',
    })

    expect(request.status).toBe('pending')
    expect(request.manifestDigest).toMatch(/^(?:[A-Za-z0-9+/]{4}){16}$/)

    await expect(store.authorize({
      requestId: request.id,
      manifestDigest: 'A'.repeat(64),
      demoPin: '0426',
    })).rejects.toThrow(/manifest/i)

    const authorized = await store.authorize({
      requestId: request.id,
      manifestDigest: request.manifestDigest,
      demoPin: '0426',
    })

    expect(authorized.status).toBe('demo-recorded')
    expect(authorized.receipt?.adapter).toBe('in-memory-fabric-demo')
    expect(authorized.receipt?.transactionId).toMatch(/^demo-memory-/)
    expect(authorized.receipt?.cryptographicProof).toBe(true)
    expect(authorized.proof?.status).toBe('verified')
    expect(authorized.proof?.manifest.digest).toBe(request.manifestDigest)
    expect(await store.read(request.id)).toEqual(authorized)
    expect(gatewayCalls).toEqual(['record', 'read'])
    expect(authorized.receipt?.transactionId).toBe('demo-memory-authoritative')

    await expect(store.authorize({
      requestId: request.id,
      manifestDigest: request.manifestDigest,
      demoPin: '0426',
    })).rejects.toThrow(/pending/i)
  })

  it('records rejection without creating a receipt', async () => {
    const store = createDemoSigningStore({ delayMs: 0 })
    const request = await store.createRequest({ caption: 'Declined draft', mediaId: 'synthetic-coastline-002' })
    const rejected = store.reject(request.id)

    expect(rejected.status).toBe('rejected')
    expect(rejected.receipt).toBeUndefined()
    expect(store.list()).toContainEqual(rejected)
  })
})
