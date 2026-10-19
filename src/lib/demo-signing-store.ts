import { createHash, randomUUID } from 'node:crypto'
import {
  ManagedSigningAlgorithm,
  ManagedSigningKeyPurpose,
  UserPresenceMethod,
  type ManagedSignatureProof,
  type SocialPublicationContent,
  type SocialPublicationDemoRecord,
} from 'antifraud-data-utils-ts'
import { NodeManagedWallet, createManagedSigningBff } from 'antifraud-sdk-node-ts'

export type DemoSigningStatus = 'pending' | 'rejected' | 'demo-recorded'

export type DemoSigningReceipt = Readonly<{
  adapter: 'in-memory-fabric-demo'
  transactionId: string
  recordedAt: string
  cryptographicProof: true
}>

export type DemoSigningRequest = Readonly<{
  id: string
  caption: string
  mediaId: string
  manifestDigest: string
  relyingParty: 'https://social-demo.antifraud.services'
  purpose: 'synthetic-publication-manifest-signing'
  signingKeyContext: string
  createdAt: string
  status: DemoSigningStatus
  proof?: ManagedSignatureProof
  receipt?: DemoSigningReceipt
}>

export type DemoSigningStore = Readonly<{
  createRequest(input: Readonly<{ caption: string; mediaId: string }>): Promise<DemoSigningRequest>
  authorize(input: Readonly<{ requestId: string; manifestDigest: string; demoPin: string }>): Promise<DemoSigningRequest>
  reject(requestId: string): DemoSigningRequest
  read(requestId: string): Promise<DemoSigningRequest | undefined>
  list(): DemoSigningRequest[]
}>

type DemoSigningStoreOptions = Readonly<{
  delayMs?: number
  now?: () => Date
  gateway?: Readonly<{
    recordSocialPublication(input: Readonly<{
      content: SocialPublicationContent
      proof: ManagedSignatureProof
    }>): Promise<SocialPublicationDemoRecord>
    readSocialPublication(publicationId: string): Promise<SocialPublicationDemoRecord>
  }>
}>

const RELYING_PARTY = 'https://social-demo.antifraud.services' as const
const PURPOSE = 'synthetic-publication-manifest-signing' as const
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
  return createHash('sha3-384').update(canonicalManifest(input), 'utf8').digest('base64')
}

function wait(delayMs: number): Promise<void> {
  return delayMs > 0
    ? new Promise((resolve) => setTimeout(resolve, delayMs))
    : Promise.resolve()
}

function fromGatewayRecord(record: SocialPublicationDemoRecord): DemoSigningRequest {
  return Object.freeze({
    id: record.id,
    caption: record.content.caption,
    mediaId: record.content.mediaId,
    manifestDigest: record.proof.manifest.digest,
    relyingParty: record.proof.relyingParty as DemoSigningRequest['relyingParty'],
    purpose: record.proof.purpose as DemoSigningRequest['purpose'],
    signingKeyContext: record.proof.verificationMethod,
    createdAt: record.proof.createdAt,
    status: 'demo-recorded',
    proof: record.proof,
    receipt: record.receipt,
  })
}

export function createDemoSigningStore(options: DemoSigningStoreOptions = {}): DemoSigningStore {
  const records = new Map<string, DemoSigningRequest>()
  const now = options.now ?? (() => new Date())
  const delayMs = options.delayMs ?? 6_000
  const wallet = new NodeManagedWallet()
  const walletOwner = 'urn:user:synthetic-social-demo'
  const deviceId = 'urn:device:synthetic-social-demo'
  let localPresenceVerified = false
  const bff = createManagedSigningBff({
    wallet,
    userPresence: async () => ({biometricAvailable: false, verified: localPresenceVerified}),
  })
  const walletKeys = wallet.provision(walletOwner, {seedMaterial: 'synthetic-social-demo-wallet'})

  function requireRecord(requestId: string): DemoSigningRequest {
    const record = records.get(requestId)
    if (!record) throw new Error('Signing request was not found.')
    return record
  }

  return {
    async createRequest(input) {
      const caption = input.caption.trim()
      const mediaId = input.mediaId.trim()
      if (!caption || !mediaId) throw new Error('Caption and media identifier are required.')

      const id = randomUUID()
      const createdAt = now()
      const manifestDigest = digestManifest({caption, mediaId})
      const keys = await walletKeys
      await bff.create({
        requestId: id,
        operationId: `urn:operation:${id}`,
        manifest: {id: `urn:manifest:${id}`, version: '1', digestAlgorithm: 'sha3-384', digest: manifestDigest},
        createdAt: createdAt.toISOString(),
        expiresAt: new Date(createdAt.getTime() + 5 * 60_000).toISOString(),
      }, {
        authenticatedUserId: walletOwner,
        registeredDeviceId: deviceId,
        relyingParty: RELYING_PARTY,
        purpose: PURPOSE,
        signerReference: walletOwner,
        signingKey: {
          purpose: ManagedSigningKeyPurpose.ActorSigning,
          algorithm: ManagedSigningAlgorithm.MlDsa65,
          verificationMethod: keys.actorSigning.verificationMethod,
        },
      })
      const request: DemoSigningRequest = {
        id,
        caption,
        mediaId,
        manifestDigest,
        relyingParty: RELYING_PARTY,
        purpose: PURPOSE,
        signingKeyContext: keys.actorSigning.verificationMethod,
        createdAt: createdAt.toISOString(),
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
      const context = {
        requestId: record.id,
        authenticatedUserId: walletOwner,
        registeredDeviceId: deviceId,
        operationId: `urn:operation:${record.id}`,
        manifestDigest: record.manifestDigest,
        relyingParty: record.relyingParty,
        purpose: record.purpose,
      }
      const signingTime = now().toISOString()
      localPresenceVerified = true
      try {
        await bff.authorize({...context, method: UserPresenceMethod.Pin, authorizedAt: signingTime})
      } finally {
        localPresenceVerified = false
      }
      const proof = await bff.sign({...context, signedAt: signingTime})
      if (options.gateway) {
        await options.gateway.recordSocialPublication({
          content: {caption: record.caption, mediaId: record.mediaId},
          proof,
        })
        const authoritative = fromGatewayRecord(
          await options.gateway.readSocialPublication(record.id),
        )
        records.set(authoritative.id, authoritative)
        return authoritative
      }
      await wait(delayMs)
      const current = requireRecord(input.requestId)
      if (current.status !== 'pending') throw new Error('Only a pending request can be authorized.')

      const authorized: DemoSigningRequest = {
        ...current,
        status: 'demo-recorded',
        proof,
        receipt: {
          adapter: 'in-memory-fabric-demo',
          transactionId: `demo-memory-${randomUUID()}`,
          recordedAt: now().toISOString(),
          cryptographicProof: true,
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

    async read(requestId) {
      const local = records.get(requestId)
      if (local) return local
      if (!options.gateway) return undefined
      try {
        const authoritative = fromGatewayRecord(await options.gateway.readSocialPublication(requestId))
        records.set(authoritative.id, authoritative)
        return authoritative
      } catch {
        return undefined
      }
    },

    list() {
      return [...records.values()]
    },
  }
}
