// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

describe('social demo BFF route', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('ANTIFRAUD_SOCIAL_DEMO_MODE', 'true')
    vi.stubEnv('ANTIFRAUD_SOCIAL_DEMO_DELAY_MS', '0')
  })

  afterEach(() => {
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
    expect(reloaded.request.receipt.cryptographicProof).toBe(false)
  })

  it('fails closed when demo mode is not explicitly enabled', async () => {
    vi.stubEnv('ANTIFRAUD_SOCIAL_DEMO_MODE', '')
    const response = await GET(new Request('http://local.test/api/demo'))
    expect(response.status).toBe(503)
  })
})
