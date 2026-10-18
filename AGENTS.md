# Antifraud Social Demo agent contract

Read `.codex/skills/build-antifraud-social-demo/SKILL.md` before changing this
portal.

This repository owns only the synthetic social relying-party demonstration.
It does not own identity, private-key custody, Antifraud contracts, gateway
authorization or Fabric policy. Browser state never grants authority.

Use red-green-refactor TDD. Every test file starts with the mandatory
flow-contract comment. Every browser test states the complete numbered journey
plus authorization and persistence invariants.

Demo mode uses an explicitly labelled in-memory Fabric adapter. It may be
enabled only for local/test execution or an explicit staging demonstration.
It is forbidden in Test Network and production network profiles. Its receipt
is never reported as a cryptographic signature or a Fabric transaction.

Validate Node.js 24, unit tests, typecheck, production build and desktop/mobile
Playwright. Store screenshots as flat Git-ignored files named
`antifraud-social-demo-<yyyymmdd-hhmmss>-<action>-<language>-<viewport>.png`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
