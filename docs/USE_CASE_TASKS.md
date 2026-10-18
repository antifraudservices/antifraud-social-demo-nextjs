# Social publication signing use-case tasks

These tasks describe the bounded synthetic demo. The Antifraud Data Space MVP
Prompt v8 remains the complete contract and takes precedence if this summary
omits a requirement.

## Preliminary demo now present

The current portal implements only the preliminary slice of UC-SOC-01 through
UC-SOC-04: synthetic composer, BFF-created SHA3-384 manifest digest, explicit
review, demo PIN ceremony, rejection, in-memory receipt and BFF reload. It does
not yet produce a cryptographic proof, call a managed wallet, persist through a
gateway, write Fabric or implement C2PA. The interface labels that boundary.

## Canonical document and attachment boundary

Antifraud never models a file as FHIR `DocumentReference`. The business graph
uses Schema.org `DigitalDocument` and `MediaObject`. PDF, Excel, Word, image,
video and any other governed media bytes travel separately in DIDComm
`attachments[]`, inline as `data.base64` or by protected reference as
`data.links + data.hash`. The canonical minimal-PDF contract and proof are
tracked by [antifraud-data-utils-ts issue #2](https://github.com/antifraudservices/antifraud-data-utils-ts/issues/2).

Age-over already exists in the controller-to-employee evidence flow. Any
future relying-party age presentation consumes that authoritative predicate;
it does not create another age-over derivation.

## UC-SOC-01 — Request a signature before publication

1. A synthetic signed-in user prepares a text, image or video publication.
2. The trusted BFF uploads or references the immutable bytes and asks the
   canonical Antifraud layer to build the governed publication manifest.
3. The UI shows relying party, purpose, exact asset versions, manifest digest,
   signing-key context and expiry before asking for authorization.
4. The request remains pending. Creating the request or pressing a button does
   not sign or publish anything.

Task gates:

- Define missing request, manifest, proof, receipt and state contracts
  test-first in `antifraud-data-utils-ts`.
- Reuse the neutral Communication and protected document-manifest contracts.
- Reject mutable URLs, browser-authored digests, arbitrary wallet identifiers
  and caller-selected gateway or Fabric routing.

## UC-SOC-02 — Authorize with local user presence

1. The user chooses to review and sign the exact pending request.
2. The device performs the governed local user-presence ceremony: biometrics
   when supported, otherwise the approved PIN or password fallback.
3. Unlock creates only a short BFF session bound to user, registered device,
   operation, manifest digest, purpose, relying party and expiry.
4. The BFF calls the reviewed high-level SDK and managed wallet.
5. React receives only public proof metadata and a receipt.

Task gates:

- Never implement cryptography, canonicalization or private-key custody in the
  portal.
- Prove that cancellation, lock, timeout, replay or any binding change fails
  closed and destroys or rejects the unlocked session.
- Prove logs, errors, receipts and persisted records contain no biometric
  material, credential secret, seed or private key.

## UC-SOC-03 — Reject, cancel or expire

The user may reject a request before unlock, cancel during review or allow it
to expire. Each outcome is explicit, durable and distinct from a failed
signature. None creates a proof or publishes a signed-status indicator.

Task gates:

- Preserve the original request and terminal reason for authorized audit.
- Make retries idempotent and require a new operation when policy says the old
  request is terminal.
- Return no derived identity, qualification or document access on rejection.

## UC-SOC-04 — Publish and verify the signed asset

1. Publication occurs only after the required proof verifies against the exact
   immutable manifest.
2. The post displays a restrained signed-content indicator.
3. A verifier can inspect signer or pseudonymous key context, purpose,
   algorithm, signing time, manifest digest, proof status and receipt without
   receiving private material.
4. Changing bytes, caption, asset order, version, purpose, signer, relying
   party or proof invalidates verification.

Task gates:

- Keep signature verification separate from claims that content is factual,
  human-created or legally qualified.
- Validate historical key status at signing time, not only current status.
- Keep full media and personal relationships out of shared-ledger anchors.

## UC-SOC-05 — Receive a third-party signature request

The same inbox accepts a governed request created by another synthetic relying
party. The user sees who requested the signature, for which immutable manifest,
for what purpose and until when. Approval is limited to that request and never
grants general account, contact, identity or evidence access.

Task gates:

- Use authenticated discovery and approved service bindings; never accept an
  arbitrary callback or provider URL from the browser.
- Prove wrong audience, changed callback, provider substitution, replay and
  cross-tenant correlation fail closed.

## UC-SOC-06 — Multiple signers and countersignature

For an explicitly enabled scenario, several independent people may sign the
same immutable manifest. Use an unordered proof set when order is irrelevant
and an ordered proof chain when a later countersignature depends on an earlier
proof. Natural signer, represented organization, assignment, key and delivery
actor remain separate.

Task gates:

- Do not turn several proof creators into several credential issuers.
- Verify every signer and every previous-proof link independently.
- Replacing a document creates a new manifest version and never rewrites
  historical signatures.

## UC-SOC-07 — Media provenance interoperability

For image and video demonstrations, add C2PA as an explicit adapter rather than
as Antifraud's internal persistence model. The adapter must declare the exact
supported C2PA version and algorithms. Test ML-DSA-65 now against the exact
C2PA asset and Antifraud manifest. Until the selected C2PA profile permits it
as a conforming claim-signature algorithm, use a standards-compatible C2PA
claim signature plus a separately governed ML-DSA-65 companion proof when
policy requires both. A direct ML-DSA C2PA claim-signature experiment is
labelled non-conformant laboratory evidence.

Task gates:

- Fail closed if either proof required by hybrid policy is absent or invalid.
- Do not claim C2PA proves truth, human authorship or absence of generative AI.
- Keep the C2PA manifest, Antifraud manifest and proof bindings explicit and
  test deterministic conversion between them.
- Track the canonical proof in [antifraud-data-utils-ts issue #3](https://github.com/antifraudservices/antifraud-data-utils-ts/issues/3).

## GitHub issue chain

The prompt is the complete contract. Executable work is owned by these issues:

Social relying-party portal:

1. [UC-SOC-01: request a signature before publication](https://github.com/antifraudservices/antifraud-social-demo-nextjs/issues/1).
2. [UC-SOC-02: authorize with local user presence and managed wallet](https://github.com/antifraudservices/antifraud-social-demo-nextjs/issues/2).
3. [UC-SOC-03: persist rejection, cancellation and expiry](https://github.com/antifraudservices/antifraud-social-demo-nextjs/issues/3).
4. [UC-SOC-04: publish and verify an immutable signed asset](https://github.com/antifraudservices/antifraud-social-demo-nextjs/issues/4).
5. [UC-SOC-05: receive a third-party signature request](https://github.com/antifraudservices/antifraud-social-demo-nextjs/issues/5).
6. [UC-SOC-06: support multiple signers and countersignature](https://github.com/antifraudservices/antifraud-social-demo-nextjs/issues/6).
7. [UC-SOC-07: demonstrate C2PA and ML-DSA-65 interoperability](https://github.com/antifraudservices/antifraud-social-demo-nextjs/issues/7).

Shared dependencies and sibling portals:

1. [Canonical attachment contract and minimal PDF proof](https://github.com/antifraudservices/antifraud-data-utils-ts/issues/2).
2. [SDK Core delivery orchestration](https://github.com/antifraudservices/antifraud-sdk-core-ts/issues/5).
3. [SDK Node trusted transport](https://github.com/antifraudservices/antifraud-sdk-node-ts/issues/5).
4. [Gateway confidential persistence and retrieval](https://github.com/antifraudservices/antifraud-gw-node-ts/issues/1).
5. [Reusable controlled attachment panel](https://github.com/antifraudservices/antifraud-portal-components-react/issues/5).
6. [Professional send/review interface](https://github.com/antifraudservices/antifraud-professional-nextjs/issues/1).
7. [Personal receive/authorize interface](https://github.com/antifraudservices/antifraud-personal-next/issues/1).
8. [C2PA and ML-DSA-65 interoperability proof](https://github.com/antifraudservices/antifraud-data-utils-ts/issues/3).

## Required acceptance journeys

The future implementation must add numbered browser journeys whose first lines
state authorization and persistence invariants. At minimum prove:

1. own post → request → review → local unlock → proof → publication → reload;
2. rejection and expiry with no proof or signed indicator;
3. changed content and replay rejected after authorization;
4. third-party request with exact audience and callback binding;
5. one multi-party proof set and one ordered countersignature chain;
6. media-provenance adapter verification and hybrid-policy failure.

The normal path is browser → authenticated BFF → high-level SDK → gateway and
authoritative readback. Component fixtures, mocked routes, screenshots, API-only
tests or HTTP success do not satisfy it. Promote in order:
`test → local-network → test-network → network`.
