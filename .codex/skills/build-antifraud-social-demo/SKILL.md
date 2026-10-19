---
name: build-antifraud-social-demo
description: Build or audit the synthetic Antifraud social relying-party demo for publication signature requests, managed-wallet authorization, signed-asset verification, multi-party proofs and C2PA interoperability.
---

# Build Antifraud Social Demo

## Read before changing anything

1. Read the Antifraud Data Space MVP Prompt v10 supplied by the project owner.
2. Read `README.md` and `docs/USE_CASE_TASKS.md` completely.
3. Inspect the current branches, package versions and executable contracts in
   `antifraud-data-utils-ts`, `antifraud-sdk-core-ts`,
   `antifraud-sdk-node-ts`, `gdc-sdk-core-ts`, `gdc-sdk-node-ts` and
   `sos-sdk-core-ts` before designing an application API.
4. Treat the current UI and in-memory adapter as preliminary demo evidence.
   Preserve their explicit `cryptographicProof: false` boundary until a task
   implements and proves the real high-level SDK path.

## Ownership and trust boundaries

- This portal is a synthetic relying party. It does not own identity, wallet
  custody, gateway authorization, evidence storage or ledger policy.
- The browser never selects a tenant, service host, channel, chaincode,
  signing key identifier or authority tuple.
- Login authenticates a portal session; it does not authorize a signature.
- A signature request is a governed Communication bound to an immutable
  manifest. Delivery, read state, approval and publication remain different
  events.
- Private keys remain in the managed wallet. React receives only public proof
  metadata and receipts.
- Reuse the high-level SDK path. Do not instantiate low-level wallet or
  cryptography helpers in React or invent portal-local canonicalization.
- Antifraud governs the request, policy, proof and evidence lifecycle; it does
  not become the root identity store.
- Antifraud documents are Schema.org `DigitalDocument`/`MediaObject` graphs.
  Never introduce FHIR or `DocumentReference`. Binary files of any governed
  media type travel only in DIDComm `attachments[]`, inline or by protected
  reference, using the released data-utils contract.
- Reuse the existing controller-to-employee age-over evidence. A relying-party
  flow requests the authoritative predicate and never derives a duplicate.

## Mandatory implementation order

1. Start from a clean current base and create a feature branch.
2. Add the smallest failing contract test in the owning lowest package. Every
   new or modified test begins with:
   `// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.`
3. Define missing governed types, validators, fixtures and JSON Schemas in
   `antifraud-data-utils-ts`; never duplicate wire literals in this portal.
4. Add runtime-neutral orchestration to `antifraud-sdk-core-ts` and server/BFF
   integration to `antifraud-sdk-node-ts` only when the reviewed contracts
   require them.
5. Prove the complete affected local and local-network journeys first with
   immutable `npm pack` tarballs installed `--no-save`. Do not publish an
   isolated shared package merely because its own tests are green. Never
   commit `file:`, Git, workspace or vendored dependencies.
6. Build the portal BFF and UI from controlled components. Server-owned actor,
   device, audience, purpose, manifest and authority fields are read-only in
   the browser.
7. Run unit, integration, real Demo browser and Playwright gates with Node 24,
   then real local-network ledger write and authoritative readback. Only after
   both matrices are green may one cumulative release publish shared packages
   from the lowest dependency upward and pin exact registry versions. Test
   Network follows that release; Production remains disabled.

Demo keeps the same UI, options, controlled components, validation and business
flows intended for Test Network. Only its Fabric boundary uses the fixed
six-second in-memory simulation. Reuse the existing trusted BFF/gateway
collection-prefix resolver; React never supplies a prefix or environment
authority, and tests prove Demo cannot access Test Network or Production
namespaces.

## Signing-session invariants

The unlock session is short-lived and bound to the authenticated user,
registered device, exact operation, manifest digest, purpose and relying party.
Biometric unlock is required when supported; the governed PIN or password path
is the fallback. Lock, expiry, cancellation, replay, content change, purpose
change, relying-party change, wrong user or wrong device fails closed.

Never persist or log biometric material, PIN, password, wallet seed or private
key. Do not make a test green with a fake signature, accepted error, placeholder
receipt or pending terminal state.

## Proof and media rules

- ML-DSA-65 proofs use the reviewed JOSE or COSE representation selected by
  the canonical Antifraud contract.
- Keep digest, content identifier, proof location, verification method, signing
  time and key-status history separate.
- Multiple independent signers use a proof set; ordered approval or
  countersignature uses a proof chain with explicit previous-proof binding.
- C2PA is an interoperability adapter for media provenance. Declare its exact
  version and supported algorithm set. Test ML-DSA-65 against the exact same
  asset and Antifraud manifest. Do not label the companion proof as a native
  C2PA claim signature when the selected version does not permit it; a direct
  ML-DSA experiment is explicitly non-conformant laboratory evidence.
- A valid signature or C2PA manifest does not prove that media is truthful,
  human-created or legally qualified.

## Evidence and claims

Report these separately:

- component or local test evidence;
- real Demo portal → BFF → SDK → gateway authoritative readback;
- explicitly simulated ledger receipt;
- local-network and Test Network results reported separately from Demo; the
  one-orderer Test Network profile is non-HA and non-production; and
- Production disabled.

A screenshot, fixture, mock, HTTP 200 or memory-adapter receipt is never
on-chain, local-network, Test Network or Production proof. Demo may be shown
before Fabric is ready, but package publication and Test Network promotion
remain blocked until the affected local-network gate is green.

When preparing Firebase App Hosting, never request or commit a service-account
key. The project owner authorizes the official Firebase GitHub application and
selects project, region, backend and branch. Use Application Default
Credentials for Firebase Admin/Firestore and Secret Manager references for
secrets. Verify each persistence adapter and its tests before claiming support.

Before implementing Google login, read `docs/BETA_FIREBASE_AUTH.md`. Enabling
the provider is only one gate: use this portal's distinct web-app registration,
authorize `localhost` plus every deployed Beta domain, validate the exact
Firebase issuer and audience in the BFF, and keep request, wallet, manifest and
purpose authorization separate. Choose either the Auth Emulator or live local
Google login. Preserve popup behavior with COOP `same-origin-allow-popups`
where needed and no global COEP `require-corp`. The Foundation is a bounded
tenant of `host-beta.antifraud.services`; its person-index bindings are under
`antifraud.online` and are never selected by the browser or a callback.
