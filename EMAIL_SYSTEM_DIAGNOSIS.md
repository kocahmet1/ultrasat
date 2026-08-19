# UltraSAT Email System — Diagnosis & Fix Plan

**Date:** 2026-08-18 · **Investigated by:** Claude (live tests run against SendGrid, DNS, Firebase Auth, and the deployed site)
**Symptom:** After signup the app shows "Please verify your email — check your inbox," but no email ever arrives.

---

## 1. Executive summary

The verification email system fails because of **four independent breaks stacked on top of each other**. Any one of them would degrade the system; together they guarantee that in production nothing usable arrives.

1. The **SendGrid account cannot send at all** — every API send is rejected with `401 Maximum credits exceeded` (the account is on the free-trial credit ceiling / expired trial state).
2. The **sender domain `ultrasatprep.com` no longer exists** (NXDOMAIN — the registration lapsed). The verified sender `noreply@ultrasatprep.com` can therefore never be verified again, and no SPF/DKIM/DMARC records can exist.
3. The **production frontend calls `http://localhost:3001`** — the API URL is baked into the production JS bundle from the root `.env`, so the branded-email path can't even reach your API from a visitor's browser.
4. The **Firebase fallback does send** (verified live: HTTP 200), but from `noreply@ultrasat-5e4c4.firebaseapp.com` with the plain default template — which lands in **Spam** for many providers — and Firebase **throttles repeat sends within seconds** (`TOO_MANY_ATTEMPTS_TRY_LATER`), while the app **silently swallows every failure** and shows "check your inbox" regardless.

**Decisions made:** switch to **Resend** (free tier: 3,000 emails/month, 100/day), cover the **full email system** (verification + password reset + deliverability + error surfacing), and bridge the gap until your new **.ai domain** is purchased. One hard constraint discovered during research: **Resend cannot send to real users until a domain is verified** — its built-in `onboarding@resend.dev` test sender only delivers to your own account address. So the plan has an explicit interim phase (Firebase-managed emails, done properly) and a cutover phase the day the domain exists.

> First practical check: search the inbox that you tested with for `noreply@ultrasat-5e4c4.firebaseapp.com` — including Spam. The very first signup attempt most likely *did* produce a Firebase email there; subsequent resend attempts were throttled and silently dropped.

---

## 2. How the system is wired today

```
Signup.jsx ──> AuthContext.signup()
                 ├─ createUserWithEmailAndPassword (Firebase Auth)
                 ├─ updateProfile + initializeUserAccount (Firestore)
                 └─ sendVerificationEmailWithFallback()          [try/catch: errors only console.error'd]
                       │
                       ├─ PRIMARY: POST {REACT_APP_API_URL}/api/email/send-verification
                       │            └─ apps/api/emailRoutes.js (requireAuth)
                       │                 ├─ admin.auth().generateEmailVerificationLink(email,
                       │                 │      { url: FRONTEND_URL + '/verify-email' })
                       │                 └─ emailService.js → SendGrid API
                       │                      from: SENDGRID_VERIFIED_SENDER (noreply@ultrasatprep.com)
                       │
                       └─ FALLBACK (on any failure): firebase/auth sendEmailVerification(user,
                                { url: window.location.origin + '/verify-email' })
                                → Google sends default template from noreply@ultrasat-5e4c4.firebaseapp.com

UI: EmailVerificationBanner (yellow bar) · /verify-email page (resend + "I've verified")
Related: /api/email/send-password-reset exists on the backend — but NOTHING in the frontend calls it,
and there is no "Forgot password?" UI at all. Contact form uses a separate EmailJS account.
```

The design itself (Admin-generated link + branded email via a provider, with Firebase as fallback) is sound. The failures are configuration, account state, and error handling — not architecture.

---

## 3. Verified findings (with evidence)

### F1 — SendGrid account is out of credits: every send fails ⛔
A sandbox-mode send (validates the request, delivers nothing) returned:
`HTTP 401 — {"errors":[{"message":"Maximum credits exceeded"}]}`
Per SendGrid's own support doc, this means the account is on the **Email API Free Trial** state (100 credits/day ceiling, or a lapsed/downgraded trial) — sending stays blocked until a paid Email API plan is active. The API key itself is **valid** (a `GET /v3/scopes` returned 200 with `mail.send`), so this is an account/billing state, not a key problem.

### F2 — `ultrasatprep.com` is NXDOMAIN: the sender identity can't exist ⛔
Both Google and Cloudflare resolvers return status 3 (NXDOMAIN) for the apex `A`, `NS`, `SOA`, `MX`, `TXT`, `s1/s2._domainkey`, and `_dmarc` records — the registration has lapsed entirely. Consequences: the configured sender `noreply@ultrasatprep.com` can never be (re)verified at any provider; no SPF/DKIM/DMARC is possible; and stale references to the dead domain remain in `serverApp.js` (CORS allowlist, sitemap URLs) and `emailService.js` (support@ultrasat.com footer, also fictional).

### F3 — Production bundle calls `http://localhost:3001` ⛔
`vite.config.js` loads env files from the workspace root for **all modes** and defines `process.env` from every `REACT_APP_*` var. The root `.env` sets `REACT_APP_API_URL=http://localhost:3001`, and `.env.production` does not override it. Confirmed baked into the build output on disk (`grep localhost:3001 build/static/js/*` → dozens of bundles, and 16 source files consume `REACT_APP_API_URL`). On `https://ultrasat.onrender.com` the browser therefore tries the *visitor's own machine*, fails, and every signup rides the fallback path. This also silently degrades every other API-backed feature in production that uses the same pattern.

### F4 — Render has no email env vars defined in code ⚠️
`render.yaml` sets only `NODE_ENV=production`. Everything else (`SENDGRID_API_KEY`, `SENDGRID_VERIFIED_SENDER`, `FRONTEND_URL`, Firebase Admin creds) must exist in the Render dashboard. If `FRONTEND_URL` is unset there, `emailRoutes.js` defaults the verification link's continue-URL to `http://localhost:3000/verify-email` — so even a *successful* branded email would bounce users to localhost after verifying.

### F5 — The Firebase fallback works, but it's spam-prone, throttled, and silent ⚠️
Live test against your project (throwaway account, deleted afterwards):
- First `sendOobCode VERIFY_EMAIL` with continue-URL `https://ultrasat.onrender.com/verify-email` → **HTTP 200** (Firebase accepted and sent).
- Second attempt seconds later → **HTTP 400 `TOO_MANY_ATTEMPTS_TRY_LATER`**.

So Firebase *is* delivering the default template from `noreply@ultrasat-5e4c4.firebaseapp.com` (spam-prone, unbranded), and rapid retries — exactly what a user does when nothing arrives — get throttled. `AuthContext.signup()` catches the error and only `console.error`s it; the banner tells the user to check their inbox either way.

### F6 — Firebase authorized-domains list is out of sync with reality ⚠️
Current list (fetched from the project's public config): `localhost`, `ultrasat-5e4c4.firebaseapp.com`, `ultrasat-5e4c4.web.app`, `ultrasat.onrender.com`, `ultrasatprep.com` (dead). The CORS config also references `veritas-blue.netlify.app` and `veritas-blue-web.onrender.com` (the latter now returns 404) — neither is authorized in Firebase, so if the app were ever served there, the fallback `sendEmailVerification` would throw `auth/unauthorized-continue-uri` and be swallowed: **zero email, no visible error**. Your live production origin `ultrasat.onrender.com` *is* authorized — good.

### F7 — Password reset is unreachable: the UI doesn't exist ⛔ (feature gap)
`POST /api/email/send-password-reset` is implemented on the backend, but a repo-wide grep finds **no frontend caller, no route, and no "Forgot password?" link** in `Login.jsx`. A user who forgets their password today has no recovery path at all.

### F8 — The password-reset endpoint has security gaps 🔒
It is unauthenticated (correct for a reset flow) but returns `404 "User not found"` for unknown emails — an **account-enumeration oracle** — and has no endpoint-specific rate limit (only the global 100 req/15 min/IP), so once a provider works it can be abused to spam arbitrary users with reset emails.

### F9 — UX invites the throttle and hides failures ⚠️
No cooldown on the `/verify-email` "Resend" button; no surfaced distinction between "sent via branded path," "sent via Firebase — check spam," and "throttled — wait a few minutes." The signup flow never tells the user anything failed.

### F10 — Housekeeping (mostly good, some cleanup) ✅/🧹
`.env` and the Firebase service-account JSON are properly gitignored and not tracked in git — good. Cleanup items: the SendGrid key should be revoked and the account closed once migrated; `SENDGRID_SETUP_INSTRUCTIONS.md` is now obsolete (and its checklist was never completed — domain verification, Render env vars, prod API URL); the EmailJS contact-form credentials in `.env` are a separate, working system (public-by-design keys) — leave as is or fold into Resend later.

---

## 4. Root-cause chain for "I signed up and got nothing"

On production (`ultrasat.onrender.com`): the bundle calls `localhost:3001` (F3) → fetch fails → fallback fires the **Firebase default email** — which very likely arrived in **Spam** on the first attempt (F5) → user retries / re-signs-up → Firebase throttles (`TOO_MANY_ATTEMPTS`) → error swallowed (F9) → genuinely no email from then on. Meanwhile the branded SendGrid path is doubly dead everywhere (F1 + F2), including local dev where the API *is* reachable.

---

## 5. Target architecture

Same shape as today, with the provider swapped, the config fixed, and failures made visible:

```
Signup / VerifyEmail / ForgotPassword
   └─ POST  {same-origin}/api/email/…        ← relative URL; Vite dev proxy handles localhost
        ├─ Firebase Admin generates the action link (verify / reset)
        │     continue-URL = FRONTEND_URL env var (correct per environment)
        └─ emailService.js  → provider selected by EMAIL_PROVIDER env var
              ├─ "resend"   → Resend API, from noreply@<your .ai domain>   (after domain cutover)
              └─ "firebase" → skip API sending; client uses Firebase default email (interim mode)
   UI surfaces the actual result: sent-branded / sent-firebase-check-spam / throttled-wait / failed
```

Key constraint shaping the phases: **Resend requires a verified domain to email real users** (its `resend.dev` test sender only delivers to your own account address, and the free tier includes 1 domain, 3,000 emails/mo, 100/day). Until the .ai domain exists, the *only* thing that can email your users is Firebase's default sender — so Phase 0 makes that path work properly instead of accidentally.

### Environment variable matrix (target)

| Variable | Local dev | Render (now, interim) | Render (after .ai domain) |
|---|---|---|---|
| `REACT_APP_API_URL` | *(unset — relative + Vite proxy)* | *(unset — same origin)* | *(unset)* |
| `EMAIL_PROVIDER` | `firebase` (or `resend` to test) | `firebase` | `resend` |
| `RESEND_API_KEY` | your test key | — | live key (Render dashboard) |
| `EMAIL_FROM` | `UltraSAT <noreply@yourdomain.ai>` | — | `UltraSAT <noreply@yourdomain.ai>` |
| `FRONTEND_URL` | `http://localhost:3000` | `https://ultrasat.onrender.com` | `https://yourdomain.ai` |
| `NODE_ENV` | `development` | `production` | `production` |
| Firebase Admin creds | service-account file | `FIREBASE_PRIVATE_KEY` etc. (dashboard) | same |

---

## 6. Phased action plan

### Phase 0 — Stop the bleeding now (no domain, no cost, ~half a day)

1. **Fix the API URL once and for all.** In `emailVerificationService.js` (and ideally the other 15 files using `REACT_APP_API_URL`) default to *relative*: `const apiUrl = process.env.REACT_APP_API_URL || '';` → requests go to `/api/...`. Dev keeps working via the existing Vite proxy (`/api → localhost:3001`); production hits the same origin that serves the SPA. Then delete `REACT_APP_API_URL` from the root `.env` (or set it empty in `.env.production`) so localhost can never leak into a build again.
2. **Make the interim mode explicit.** Add `EMAIL_PROVIDER=firebase` handling: when set, `sendVerificationEmailWithFallback` skips the API call and goes straight to `sendEmailVerification` — no doomed fetch, no misleading console noise, and the UI can honestly say *"We've sent a verification email from noreply@ultrasat-5e4c4.firebaseapp.com — please also check Spam."*
3. **Surface failures + add a resend cooldown.** In `AuthContext.signup` capture the send result instead of swallowing it; on `auth/too-many-requests` show "You've requested too many emails — try again in ~15 minutes." Add a 60-second client cooldown on the `/verify-email` Resend button.
4. **Set Render env vars today** (dashboard): `FRONTEND_URL=https://ultrasat.onrender.com`, `EMAIL_PROVIDER=firebase`, plus the Firebase Admin variables if not already present (check the deploy logs for "Firebase Admin SDK initialized successfully").
5. **Light Firebase console polish (optional):** Authentication → Templates → edit sender *name* and subject so the default email at least says "UltraSAT". Check whether custom SMTP was ever configured there (it shouldn't be, yet).
6. **Tell affected users nothing is wrong with their account:** existing unverified users can simply use the Resend button after this deploy.

### Phase 1 — Build the Resend integration now, activate later (~1 day)

1. `npm i resend` in `apps/api`; rewrite `emailService.js` as provider-agnostic (keep your existing HTML templates — they're good):
   ```js
   const { Resend } = require('resend');
   const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

   async function sendViaResend({ to, subject, html, text }) {
     if (!resend) return { success: false, error: 'Resend not configured' };
     const { data, error } = await resend.emails.send({
       from: process.env.EMAIL_FROM,          // "UltraSAT <noreply@yourdomain.ai>"
       to, subject, html, text,
     });
     return error ? { success: false, error: error.message } : { success: true, id: data.id };
   }
   ```
   Route on `EMAIL_PROVIDER`: `resend` → send via API; `firebase`/unset → return `{success:false, code:'PROVIDER_DISABLED'}` fast so the client falls back instantly.
2. **Add the missing Forgot-password flow:** a `ForgotPassword.jsx` page (email field → calls the backend endpoint → always shows "If an account exists, we've emailed a reset link"), a `/forgot-password` route in `App.jsx`, and a "Forgot password?" link in `Login.jsx`. While `EMAIL_PROVIDER=firebase`, have the page call the client SDK's `sendPasswordResetEmail(auth, email)` instead — works today with zero backend.
3. **Fix F8 on the endpoint:** always respond `200 {success:true}` regardless of whether the user exists (log the real outcome server-side); add a per-IP limiter (e.g. 5/hour) on `/api/email/*`; keep `/api/email/test` admin-only.
4. **Update `.env.example`** and retire `SENDGRID_SETUP_INSTRUCTIONS.md` (replace with a short `EMAIL_SETUP.md` reflecting this plan).

### Phase 2 — Domain cutover day (when the .ai domain is purchased, ~2 hours + DNS wait)

1. Buy the domain; point the site at it (Render → Custom Domains) and add SSL (automatic).
2. **Resend dashboard → Domains → Add** `yourdomain.ai` → add the DNS records it gives you (DKIM TXT/CNAMEs, SPF + Return-Path) at your registrar → wait for "Verified".
3. Add a **DMARC** record: `_dmarc TXT "v=DMARC1; p=none; rua=mailto:you@…"` (tighten to `quarantine` after a clean month).
4. **Firebase console → Authentication → Settings → Authorized domains:** add `yourdomain.ai` (and remove the dead `ultrasatprep.com`; add the Netlify domain only if you actually use it).
5. Flip env on Render: `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM=UltraSAT <noreply@yourdomain.ai>`, `FRONTEND_URL=https://yourdomain.ai`.
6. Sweep stale references: CORS allowlist + sitemap in `serverApp.js`, `support@ultrasat.com` in the email footer, `robots.txt`/SEO files.
7. Optional nicety: also set Resend as **custom SMTP in Firebase** (Authentication → Templates → SMTP) so even *fallback* emails come from your domain.

### Phase 3 — Hardening & monitoring (ongoing)

Resend webhooks for bounces/complaints → log to Firestore or your logger; watch the Resend dashboard the first week; mail-tester.com score ≥ 9/10 before announcing; decide the *product* policy on unverified accounts (currently unlimited access — fine, but make it deliberate); revoke the SendGrid API key and close that account; later, migrate the EmailJS contact form to Resend to consolidate.

---

## 7. Test checklist (run after Phase 0, again after Phase 2)

- [ ] Fresh signup on production with a Gmail address → email arrives (note: inbox or spam), link verifies, banner disappears, continue-URL lands on the production domain (not localhost)
- [ ] Same with an Outlook/Hotmail address
- [ ] Resend button: works once, then shows cooldown; throttle message is human-readable
- [ ] Forgot password: existing email → reset works end-to-end; unknown email → identical generic response
- [ ] Local dev: full flow works with the API running (and degrades gracefully with it stopped)
- [ ] Server logs on Render show the provider actually used per send
- [ ] `grep -r "localhost:3001" build/` after a production build → **zero hits**

---

## 8. Sources

- [Resend — New free tier (3,000/mo, 100/day, 1 domain)](https://resend.com/blog/new-free-tier)
- [Resend docs — resend.dev test domain can only send to your own address](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)
- [SendGrid support — Understanding the "Maximum Credits Exceeded" error](https://support.sendgrid.com/hc/en-us/articles/35466138799899-Understanding-the-Maximum-Credits-Exceeded-error)
- [Twilio error 60603 — SendGrid maximum credits exceeded](https://www.twilio.com/docs/api/errors/60603)
- Live diagnostics run 2026-08-18: SendGrid `/v3/scopes` + sandbox send; Google/Cloudflare DoH for `ultrasatprep.com`; Firebase `getProjectConfig` authorized domains; Firebase `accounts:sendOobCode` fallback test (throwaway account, deleted); `build/static/js` grep on your machine.
