'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { EnvironmentSelector } from 'antifraud-portal-components-react'
import type { SocialEnvironment } from '@/src/config/environment'
import { LineIcon } from './LineIcon'

type DemoRequest = Readonly<{
  id: string
  caption: string
  manifestDigest: string
  relyingParty: string
  purpose: string
  signingKeyContext: string
  status: 'pending' | 'rejected' | 'demo-recorded'
  proof?: Readonly<{status: 'verified'; verificationMethod: string; createdAt: string}>
  receipt?: Readonly<{
    transactionId: string
    adapter: string
    cryptographicProof: true
  }>
}>

const INITIAL_CAPTION = 'Field notes from the open learning lab.'

async function demoRequest(payload?: Record<string, string>): Promise<DemoRequest | null> {
  const response = await fetch('/api/demo', payload ? {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  } : { cache: 'no-store' })
  const body = await response.json() as { request?: DemoRequest | null; error?: string }
  if (!response.ok) throw new Error(body.error ?? 'The demo operation failed.')
  return body.request ?? null
}

export function SocialSigningDemo({environment}: Readonly<{environment: SocialEnvironment}>) {
  const [caption, setCaption] = useState(INITIAL_CAPTION)
  const [request, setRequest] = useState<DemoRequest | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [demoPin, setDemoPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadRequest = useCallback(async () => {
    try {
      setRequest(await demoRequest())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load the demo.')
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    void loadRequest()
  }, [loadRequest])

  async function reviewAndSign() {
    setBusy(true)
    setError('')
    try {
      const created = request?.status === 'pending'
        ? request
        : await demoRequest({ action: 'request', caption })
      setRequest(created)
      setDialogOpen(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create the request.')
    } finally {
      setBusy(false)
    }
  }

  async function authorize() {
    setBusy(true)
    setError('')
    try {
      setRequest(await demoRequest({ action: 'authorize', demoPin }))
      setDemoPin('')
    } catch (authorizeError) {
      setError(authorizeError instanceof Error ? authorizeError.message : 'Unable to authorize the demo.')
    } finally {
      setBusy(false)
    }
  }

  async function reject() {
    setBusy(true)
    setError('')
    try {
      setRequest(await demoRequest({ action: 'reject' }))
      setDialogOpen(false)
      setDemoPin('')
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : 'Unable to reject the request.')
    } finally {
      setBusy(false)
    }
  }

  const recorded = request?.status === 'demo-recorded'

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top">Social Sandbox</a>
        <p>Demo — simulated blockchain · managed-wallet proof</p>
        <button className="profile-button" aria-label="Synthetic profile"><LineIcon name="user" /></button>
      </header>

      <nav className="side-nav" aria-label="Primary navigation">
        <a href="#feed"><LineIcon name="home" />Home</a>
        <a className="active" href="#create" aria-current="page"><LineIcon name="edit" />Create</a>
        <a href="#signed"><LineIcon name="document" />Signed posts</a>
      </nav>

      <section className="composer-column" id="create">
        <h1>Share something worth verifying</h1>
        <article className="composer">
          <label htmlFor="caption">Post caption</label>
          <textarea id="caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
          <div className="media-frame">
            <Image src="/synthetic-coastline.png" alt="Synthetic rocky coastline used as demo media" width={1672} height={941} priority />
          </div>
          <footer className="composer-actions">
            <span><LineIcon name="image" /> Synthetic media</span>
            <button className="primary-action" type="button" onClick={reviewAndSign} disabled={!loaded || busy || recorded}>
              {!loaded ? 'Loading…' : recorded ? 'Simulation complete' : busy ? 'Preparing…' : 'Review & sign'}
              {!recorded ? <LineIcon name="arrow" /> : <LineIcon name="check" />}
            </button>
          </footer>
        </article>

        <section className="feed" id="signed">
          <h2>Signed posts</h2>
          <article className="published-post">
            <header><span className="avatar-mark">S</span><div><strong>Social Sandbox</strong><small>Earlier demo · synthetic content</small></div></header>
            <p>A quieter corner for deeper learning.</p>
            <Image src="/synthetic-coastline.png" alt="Synthetic coastline in an earlier demo post" width={1672} height={941} loading="eager" />
          </article>
        </section>
      </section>

      <aside className="evidence-rail" aria-label="Signing request status">
        <EnvironmentSelector
          value={environment.active}
          onChange={() => undefined}
          testNetworkEnabled={environment.testNetworkEnabled}
          productionEnabled={environment.productionEnabled}
        />
        <h2>Signing request</h2>
        <div className={`status-panel ${recorded ? 'complete' : ''}`}>
          <span className="status-symbol">{recorded ? <LineIcon name="check" /> : null}</span>
          <div>
            <strong>{recorded ? 'Simulation recorded' : request?.status === 'rejected' ? 'Request rejected' : 'Awaiting your authorization'}</strong>
            <p>{recorded ? 'Cryptographic proof verified; the ledger receipt remains simulated.' : 'Review the exact manifest before authorizing.'}</p>
          </div>
        </div>
        <dl className="request-facts">
          <div><dt>Purpose</dt><dd>{request?.purpose ?? 'Publish this post'}</dd></div>
          <div><dt>Manifest</dt><dd><code>{request ? `${request.manifestDigest.slice(0, 14)}…` : 'Prepared by the BFF'}</code></dd></div>
          <div><dt>Relying party</dt><dd>{request?.relyingParty ?? 'Social Sandbox'}</dd></div>
          <div><dt>Signing key</dt><dd>{request?.signingKeyContext ?? 'Social / ML-DSA-65'}</dd></div>
          {request?.receipt ? <div><dt>Demo transaction</dt><dd><code>{request.receipt.transactionId.slice(0, 24)}…</code></dd></div> : null}
        </dl>
        {error ? <p className="error-message" role="alert">{error}</p> : null}
      </aside>

      {dialogOpen && request ? (
        <div className="modal-backdrop" role="presentation">
          <section className="signing-dialog" role="dialog" aria-modal="true" aria-labelledby="signing-dialog-title">
            <button className="close-button" type="button" onClick={() => setDialogOpen(false)} aria-label="Close signing request"><LineIcon name="close" /></button>
            <div className="dialog-request">
              <h2 id="signing-dialog-title">Review signing request</h2>
              <p className="dialog-intro">Authorize only this immutable publication manifest.</p>
              <dl className="dialog-facts">
                <div><dt>Purpose</dt><dd>{request.purpose}</dd></div>
                <div><dt>Relying party</dt><dd>{request.relyingParty}</dd></div>
                <div><dt>Signing key</dt><dd>{request.signingKeyContext}</dd></div>
                <div><dt>Manifest</dt><dd><code>{request.manifestDigest.slice(0, 14)}…</code></dd></div>
              </dl>
              {!recorded ? (
                <>
                  <label className="pin-label" htmlFor="demo-pin">Demo PIN</label>
                  <input id="demo-pin" type="password" inputMode="numeric" autoComplete="off" value={demoPin} onChange={(event) => setDemoPin(event.target.value)} />
                  <p className="simulation-note">Local PIN fallback · ML-DSA-65 managed-wallet signature</p>
                  {error ? <p className="error-message" role="alert">{error}</p> : null}
                  <div className="dialog-actions">
                    <button className="secondary-action" type="button" onClick={reject} disabled={busy}>Reject</button>
                    <button className="primary-action" type="button" onClick={authorize} disabled={busy || demoPin.length === 0}>{busy ? 'Recording…' : 'Authorize demo'}</button>
                  </div>
                </>
              ) : null}
            </div>
            <div className="dialog-result">
              <span className="result-check"><LineIcon name="check" /></span>
              <h3>{recorded ? 'Simulation recorded' : 'Pending authorization'}</h3>
              <p>{recorded ? 'Signature verified. The displayed ledger transaction is a Demo simulation, not Fabric.' : 'No proof or receipt exists until the signing ceremony completes.'}</p>
              {request.receipt ? <div className="receipt"><span>Demo transaction ID</span><code>{request.receipt.transactionId.slice(0, 26)}…</code></div> : null}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}
