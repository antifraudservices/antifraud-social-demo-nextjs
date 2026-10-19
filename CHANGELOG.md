# Changelog

All notable changes to this project are documented here.

## Unreleased

- Replace the preliminary BFF-only record with a managed-wallet ML-DSA-65
  ceremony and high-level SDK calls to the Gateway's Demo publication API.
- Reload the authoritative proof-bound publication from the Gateway after BFF
  process-local state is absent, while continuing to label the ledger receipt
  as a six-second in-memory simulation rather than Fabric.
- Add fail-closed Beta environment configuration, App Hosting source config,
  server-only Gateway credentials and real desktop/mobile browser coverage.
- Adopt the Demo-only MVP boundary: Test Network requires separately deployed
  Fabric and service endpoints, Production is disabled and collection prefixes
  isolate environment data.
- Add the preliminary synthetic social publication-signing UI and its explicit
  non-cryptographic in-memory demo boundary.
- Document Schema.org document metadata with DIDComm attachment transport and
  link the canonical minimal-PDF contract.
- Publish UC-SOC-01 through UC-SOC-07 as repository-owned GitHub issues while
  retaining shared-package and sibling-portal ownership links.
