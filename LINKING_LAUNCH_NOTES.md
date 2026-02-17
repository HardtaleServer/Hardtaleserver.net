# Linking Launch Notes (2026-02-16)

This is the "do not forget" file for account linking and future entitlement grant integration.

## Current state (today)
- Web linking flow exists in `public/app.js` and `server.js`.
- URL parsing on `/link` supports:
  - bare query: `/link?12345678`
  - fallback: `/link?code=12345678`
  - also tolerant forms like `/link?=12345678`
- Backend routes implemented:
  - `GET /api/link/status`
  - `POST /api/link/redeem`
- Mongo collection used:
  - `linked_accounts` (`webUserId <-> playerUuid`)
- Feature flag:
  - `LINKING_ENABLED=false` currently means **mock mode** (simulated redeem outcomes).
  - `LINKING_ENABLED=true` means live server-to-server redeem call.

## Where to change things
- Backend linking logic: `server.js`
- `/link` page UI and status states: `public/app.js`
- `/link` styles: `public/styles.css`
- Runtime env values: `.env` (local), Render dashboard env vars (deploy)

## Environment variables
Required for linking feature:
- `LINKING_ENABLED`
- `LINK_SERVICE_BASE_URL`
- `LINK_SERVICE_AUTH_TOKEN`
- `LINK_SERVICE_TIMEOUT_MS` (optional, default `8000`)

Current local defaults in `.env`:
- `LINKING_ENABLED=false`
- `LINK_SERVICE_BASE_URL=http://127.0.0.1:8080`
- `LINK_SERVICE_AUTH_TOKEN=replace-with-strong-shared-secret`
- `LINK_SERVICE_TIMEOUT_MS=8000`

## Mock mode behavior (when `LINKING_ENABLED=false`)
The backend still accepts `POST /api/link/redeem`, but uses simulated responses.

Test code prefixes (8-char codes):
- `EXPxxxxx` -> expired/invalid state
- `USEDxxxx` -> already used state
- `RATExxxx` -> rate limited state
- `DOWNxxxx` -> server unavailable state
- any other valid 8-char alphanumeric code -> simulated success

This allows testing full UI flow without a live game server.

## Live mode behavior (when `LINKING_ENABLED=true`)
`POST /api/link/redeem` calls the game server:
- `POST {LINK_SERVICE_BASE_URL}/api/v1/link/redeem`
- Body:
```json
{ "code": "12345678", "webUserId": "<clerk-user-id>" }
```
- Headers include service auth and idempotency key.

Expected redeem response from game server should include a UUID field:
- accepted keys: `playerUuid`, `playerUUID`, `uuid`, `playerId`

## Go-live checklist (linking)
1. Set production env vars in Render:
   - `LINKING_ENABLED=true`
   - `LINK_SERVICE_BASE_URL=https://<reachable-game-api-host>`
   - `LINK_SERVICE_AUTH_TOKEN=<real-secret>`
   - `LINK_SERVICE_TIMEOUT_MS=8000` (or chosen value)
2. Confirm game server endpoint is reachable from Render network.
3. Validate auth secret matches on both sides.
4. Run manual tests:
   - valid code -> linked success
   - expired code -> error message
   - already used code -> error message
   - rate limit -> error message
   - service down -> unavailable message
5. Confirm Mongo writes in `linked_accounts`:
   - unique by `webUserId`
   - unique by `playerUuid`
6. Confirm duplicate linking is blocked (409).

## Rollback checklist
If live linking has issues:
1. Set `LINKING_ENABLED=false` in Render.
2. Redeploy/restart.
3. `/link` instantly returns to mock behavior without UI rewrite.

## Planned next phase: entitlements grant
The user/plugin contract says purchases should call:
- `POST /api/v1/entitlements/grant` (backend only)
- with service auth + `idempotencyKey` + grants payload

Important:
- Retry only with the **same** idempotency key for the same purchase.
- Never retry same purchase with a new idempotency key.

Current status:
- This repository does **not** yet wire checkout to `/api/v1/entitlements/grant`.
- That should be added in `server.js` checkout flow (`/api/cart/checkout`) when server API is ready.

## Cleanup note (optional later)
For backward compatibility, code currently also reads `LINK_REDEEM_ENABLED` as a fallback env var.
After migration is stable, you can remove that fallback and standardize on `LINKING_ENABLED` only.
