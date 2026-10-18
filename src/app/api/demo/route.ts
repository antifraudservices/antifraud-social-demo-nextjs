import { resolveSocialDemoMode } from '../../../config/demo-mode'
import { createDemoSigningStore, type DemoSigningStore } from '../../../lib/demo-signing-store'

const REQUEST_COOKIE = 'antifraud-social-demo-request'
const SYNTHETIC_MEDIA_ID = 'synthetic-coastline-001'

declare global {
  var antifraudSocialDemoSigningStore: DemoSigningStore | undefined
}

function demoStore(): DemoSigningStore {
  if (!globalThis.antifraudSocialDemoSigningStore) {
    const configuredDelay = Number.parseInt(process.env.ANTIFRAUD_SOCIAL_DEMO_DELAY_MS ?? '6000', 10)
    globalThis.antifraudSocialDemoSigningStore = createDemoSigningStore({
      delayMs: Number.isFinite(configuredDelay) && configuredDelay >= 0 ? configuredDelay : 6_000,
    })
  }
  return globalThis.antifraudSocialDemoSigningStore
}

function requestIdFrom(request: Request): string | undefined {
  const cookieHeader = request.headers.get('cookie') ?? ''
  for (const field of cookieHeader.split(';')) {
    const [name, ...valueParts] = field.trim().split('=')
    if (name === REQUEST_COOKIE) return decodeURIComponent(valueParts.join('='))
  }
  return undefined
}

function unavailable(): Response {
  return Response.json({ error: 'The in-memory social demo adapter is disabled.' }, { status: 503 })
}

function currentRequest(request: Request) {
  const requestId = requestIdFrom(request)
  return requestId ? demoStore().read(requestId) : undefined
}

export async function GET(request: Request): Promise<Response> {
  if (!resolveSocialDemoMode()) return unavailable()
  return Response.json({ request: currentRequest(request) ?? null })
}

export async function POST(request: Request): Promise<Response> {
  if (!resolveSocialDemoMode()) return unavailable()

  try {
    const payload = await request.json() as Record<string, unknown>
    const action = String(payload.action ?? '')

    if (action === 'request') {
      const created = demoStore().createRequest({
        caption: String(payload.caption ?? ''),
        mediaId: SYNTHETIC_MEDIA_ID,
      })
      return Response.json(
        { request: created },
        {
          status: 201,
          headers: {
            'set-cookie': `${REQUEST_COOKIE}=${encodeURIComponent(created.id)}; Path=/; HttpOnly; SameSite=Strict`,
          },
        },
      )
    }

    const existing = currentRequest(request)
    if (!existing) return Response.json({ error: 'No active signing request.' }, { status: 404 })

    if (action === 'authorize') {
      const authorized = await demoStore().authorize({
        requestId: existing.id,
        manifestDigest: existing.manifestDigest,
        demoPin: String(payload.demoPin ?? ''),
      })
      return Response.json({ request: authorized })
    }

    if (action === 'reject') {
      return Response.json({ request: demoStore().reject(existing.id) })
    }

    return Response.json({ error: 'Unsupported demo action.' }, { status: 400 })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'The demo request failed.' },
      { status: 400 },
    )
  }
}
