import { createHash, randomUUID } from 'node:crypto'

export type DemoSigningStatus = 'pending' | 'rejected' | 'demo-recorded'

export type DemoSigningReceipt = Readonly<{
  adapter: 'in-memory-fabric-demo'
  transactionId: string
  recordedAt: string
  cryptographicProof: false
}>

export type DemoSigningRequest = Readonly<{
  id: string
  caption: string
  mediaId: string
  manifestDigest: string
  relyingParty: 'Social Sandbox'
  purpose: 'Publish this post'
  signingKeyContext: 'Social / ML-DSA-65'
  createdAt: string
  status: DemoSigningStatus
  receipt?: DemoSigningReceipt
}>

export type DemoSigningStore = Readonly<{
  createRequest(input: Readonly<{ caption: string; mediaId: string }>): DemoSigningRequest
  authorize(input: Readonly<{ requestId: string; manifestDigest: string; demoPin: string }>): Promise<DemoSigningRequest>
  reject(requestId: string): DemoSigningRequest
  read(requestId: string): DemoSigningRequest | undefined
  list(): DemoSigningRequest[]
}>

type DemoSigningStoreOptions = Readonly<{
  delayMs?: number
  now?: () => Date
}>

const RELYING_PARTY = 'Social Sandbox' as const
const PURPOSE = 'Publish this post' as const
const SIGNING_KEY_CONTEXT = 'Social / ML-DSA-65' as const
const DEMO_PIN = '0426'

function canonicalManifest(input: Readonly<{ caption: string; mediaId: string }>): string {
  return JSON.stringify({
    profile: 'antifraud-social-publication-demo-v1',
    mediaId: input.mediaId,
    caption: input.caption,
    relyingParty: RELYING_PARTY,
    purpose: PURPOSE,
  })
}

function digestManifest(input: Readonly<{ caption: string; mediaId: string }>): string {
  return createHash('sha3-384').update(canonicalManifest(input), 'utf8').digest('hex')
}

function wait(delayMs: number): Promise<void> {
  return delayMs > 0
    ? new Promise((resolve) => setTimeout(resolve, delayMs))
    : Promise.resolve()
}

export function createDemoSigningStore(options: DemoSigningStoreOptions = {}): DemoSigningStore {
  const records = new Map<string, DemoSigningRequest>()
  const now = options.now ?? (() => new Date())
  const delayMs = options.delayMs ?? 6_000

  function requireRecord(requestId: string): DemoSigningRequest {
    const record = records.get(requestId)
    if (!record) throw new Error('Signing request was not found.')
    return record
  }

  return {
    createRequest(input) {
      const caption = input.caption.trim()
      const mediaId = input.mediaId.trim()
      if (!caption || !mediaId) throw new Error('Caption and media identifier are required.')

      const request: DemoSigningRequest = {
        id: randomUUID(),
        caption,
        mediaId,
        manifestDigest: digestManifest({ caption, mediaId }),
        relyingParty: RELYING_PARTY,
        purpose: PURPOSE,
        signingKeyContext: SIGNING_KEY_CONTEXT,
        createdAt: now().toISOString(),
        status: 'pending',
      }
      records.set(request.id, request)
      return request
    },

    async authorize(input) {
      const record = requireRecord(input.requestId)
      if (record.status !== 'pending') throw new Error('Only a pending request can be authorized.')
      if (input.manifestDigest !== record.manifestDigest) throw new Error('Manifest binding mismatch.')
      if (input.demoPin !== DEMO_PIN) throw new Error('Demo PIN is invalid.')

      await wait(delayMs)
      const current = requireRecord(input.requestId)
      if (current.status !== 'pending') throw new Error('Only a pending request can be authorized.')

      const authorized: DemoSigningRequest = {
        ...current,
        status: 'demo-recorded',
        receipt: {
          adapter: 'in-memory-fabric-demo',
          transactionId: `demo-memory-${randomUUID()}`,
          recordedAt: now().toISOString(),
          cryptographicProof: false,
        },
      }
      records.set(authorized.id, authorized)
      return authorized
    },

    reject(requestId) {
      const record = requireRecord(requestId)
      if (record.status !== 'pending') throw new Error('Only a pending request can be rejected.')
      const rejected: DemoSigningRequest = { ...record, status: 'rejected' }
      records.set(rejected.id, rejected)
      return rejected
    },

    read(requestId) {
      return records.get(requestId)
    },

    list() {
      return [...records.values()]
    },
  }
}
