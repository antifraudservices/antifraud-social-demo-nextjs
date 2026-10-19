// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

describe('social demo BFF route', () => {
  let authoritativeRecord: any

  beforeEach(() => {
    globalThis.antifraudSocialDemoSigningStore = undefined
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('ANTIFRAUD_SOCIAL_DEMO_MODE', 'true')
    vi.stubEnv('ANTIFRAUD_SOCIAL_DEMO_DELAY_MS', '0')
    vi.stubEnv('ANTIFRAUD_GATEWAY_URL', 'http://gateway.local')
    vi.stubEnv('ANTIFRAUD_GATEWAY_BEARER', 'social-bff-token')
    vi.stubGlobal('fetch', vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'POST') {
        const submitted = JSON.parse(String(init.body))
        authoritativeRecord = {
          id: submitted.proof.requestId,
          environment: 'demo',
          status: 'demo-recorded',
          content: submitted.content,
          proof: submitted.proof,
          receipt: {
            adapter: 'in-memory-fabric-demo',
            transactionId: 'demo-memory-authoritative',
            recordedAt: submitted.proof.createdAt,
            cryptographicProof: true,
          },
        }
        return Response.json(authoritativeRecord, {status: 201})
      }
      return Response.json(authoritativeRecord)
    }))
  })

  afterEach(() => {
    globalThis.antifraudSocialDemoSigningStore = undefined
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('creates, authorizes and reloads the same server-owned request', async () => {
    const createResponse = await POST(new Request('http://local.test/api/demo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'request', caption: 'Field notes from the open learning lab.' }),
    }))
    expect(createResponse.status).toBe(201)
    const cookie = createResponse.headers.get('set-cookie')?.split(';')[0]
    expect(cookie).toMatch(/^antifraud-social-demo-request=/)
    const created = await createResponse.json()
    expect(created.request.status).toBe('pending')

    const authorizeResponse = await POST(new Request('http://local.test/api/demo', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: cookie! },
      body: JSON.stringify({ action: 'authorize', demoPin: '0426' }),
    }))
    expect(authorizeResponse.status).toBe(200)
    expect((await authorizeResponse.json()).request.status).toBe('demo-recorded')

    const reloadResponse = await GET(new Request('http://local.test/api/demo', {
      headers: { cookie: cookie! },
    }))
    expect(reloadResponse.status).toBe(200)
    const reloaded = await reloadResponse.json()
    expect(reloaded.request.receipt.cryptographicProof).toBe(true)
    expect(reloaded.request.receipt.transactionId).toBe('demo-memory-authoritative')
    expect(reloaded.request.proof.status).toBe('verified')
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2)
  })

  it('fails closed when demo mode is not explicitly enabled', async () => {
    vi.stubEnv('ANTIFRAUD_SOCIAL_DEMO_MODE', '')
    const response = await GET(new Request('http://local.test/api/demo'))
    expect(response.status).toBe(503)
  })
})
