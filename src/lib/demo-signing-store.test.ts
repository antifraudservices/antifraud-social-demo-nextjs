// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import { describe, expect, it } from 'vitest'
import { createDemoSigningStore } from './demo-signing-store'

describe('in-memory Fabric signing demonstration', () => {
  it('persists a bound request and a clearly simulated receipt for authoritative reload', async () => {
    const store = createDemoSigningStore({ delayMs: 0, now: () => new Date('2026-10-18T12:00:00.000Z') })
    const request = store.createRequest({
      caption: 'Field notes from the open learning lab.',
      mediaId: 'synthetic-coastline-001',
    })

    expect(request.status).toBe('pending')
    expect(request.manifestDigest).toMatch(/^[a-f0-9]{96}$/)

    await expect(store.authorize({
      requestId: request.id,
      manifestDigest: '0'.repeat(96),
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
    expect(authorized.receipt?.cryptographicProof).toBe(false)
    expect(store.read(request.id)).toEqual(authorized)

    await expect(store.authorize({
      requestId: request.id,
      manifestDigest: request.manifestDigest,
      demoPin: '0426',
    })).rejects.toThrow(/pending/i)
  })

  it('records rejection without creating a receipt', () => {
    const store = createDemoSigningStore({ delayMs: 0 })
    const request = store.createRequest({ caption: 'Declined draft', mediaId: 'synthetic-coastline-002' })
    const rejected = store.reject(request.id)

    expect(rejected.status).toBe('rejected')
    expect(rejected.receipt).toBeUndefined()
    expect(store.list()).toContainEqual(rejected)
  })
})
