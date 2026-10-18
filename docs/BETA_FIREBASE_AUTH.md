# Beta Firebase authentication handoff

This portal uses the shared `Antifraud Beta` Firebase project
(`project-f70afb24-dd73-4fb4-be5`) and its separately registered web app:

- display name: `Antifraud Social Beta`;
- Firebase app ID: `1:982931712028:web:111dfc0df8f7cced5857d9`; and
- public portal origin: `https://social-demo.antifraud.services`.

Firebase Google login establishes only the synthetic relying-party session. It
does not authorize signing, locate a person, select a personal index, grant an
age predicate or disclose a document.

## Required setup and proof

- Enable Google in **Authentication > Sign-in method** and select
  `cto@antifraud.services` as the project support email.
- Authorize the generated Firebase domains, `localhost` and all four portal
  origins: `controller-beta.antifraud.services`,
  `professional-beta.antifraud.services`,
  `personal-beta.antifraud.services` and `social-demo.antifraud.services`.
  A Firebase authorized domain has no port. Use `http://localhost:<port>`;
  `127.0.0.1` is different. New Firebase projects do not add `localhost`
  automatically.
- Associate this web app with the social App Hosting backend. Keep Test Network
  and Production disabled.
- Provide only the public browser values `NEXT_PUBLIC_FIREBASE_API_KEY`,
  `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
  `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
  `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` and
  `NEXT_PUBLIC_FIREBASE_APP_ID`.
- The BFF uses `FIREBASE_PROJECT_ID=project-f70afb24-dd73-4fb4-be5`,
  Application Default Credentials and Firebase Admin `verifyIdToken`; it must
  validate the exact issuer
  `https://securetoken.google.com/project-f70afb24-dd73-4fb4-be5` and audience
  `project-f70afb24-dd73-4fb4-be5` before applying separate request, wallet,
  manifest, relying-party and purpose policy.
- Local testing chooses either the Auth Emulator with synthetic users or live
  Google login with the real public config and `localhost`. Do not combine the
  two. Never download or commit a service-account JSON key.
- Preserve popup compatibility: use
  `Cross-Origin-Opener-Policy: same-origin-allow-popups` if needed and never a
  global `Cross-Origin-Embedder-Policy: require-corp`, which blocks Firebase's
  helper iframe and can appear as `auth/popup-closed-by-user`.
- Prove real local popup login, BFF verification, wrong issuer/audience
  rejection and authoritative reload; then repeat the browser-visible check on
  the final App Hosting/custom hostname.

The `antifraud.services` hostname is a relying-party portal origin. In Demo,
Antifraud Foundation is one bounded tenant of the gateway at
`host-beta.antifraud.services`; it gains no authority over other tenants.
Its person-index services belong under `antifraud.online` and are selected only
from a subject-controlled, verified HTTPS or `did:web` binding. The browser,
login email or callback parameter never selects an index host.
