# RevenueCat — integrated (2026-09-09)
This file is a memory aid for interacting with the user's RevenueCat account via the integration proxy later.

## Identifiers (from /setup response — verbatim)
- rc_project_id: proj03c05222
- apple_app_id: app689f66d337
- play_app_id: app8c96fbe3c6
- entitlement_lookup_key: pro
- offering_lookup_key: default
- Packages (package -> product_id, current price):
  - $rc_monthly -> prod02c23d79fe  ($4.99 / P1M, trial: none)
  - $rc_annual  -> prod2e2badc6f1  ($39.99 / P1Y, trial: none)
- Dashboard: https://app.revenuecat.com/projects/proj03c05222

Bundle id / package name: com.emergent.pourplay.nw4uh0 (iOS + Android)

Pro unlocks: unlimited AI menus, full Batch/Shopping tools (free capped at 25 guests), Syrup Lab.
Free tier: 3 AI menus total (tracked client-side in storage), tools capped at 25 guests, Syrup Lab locked.

## Status check
curl -sS -H "Authorization: Bearer <emergent-key>" "$INTEGRATION_PROXY_URL/internal/revenuecat/projects/544dcbe2-7d2c-42fa-a38f-06978f7b284d/status"
If project_state < project_created, re-fetch the RevenueCat playbook via the integration expert tool.

## Later product updates (integration proxy ONLY — never call RevenueCat REST API)
- Change price/duration/trial OR add a package (upsert):
  POST $INTEGRATION_PROXY_URL/internal/revenuecat/projects/544dcbe2-7d2c-42fa-a38f-06978f7b284d/products
  body: {"products":[{"package":"$rc_monthly","price":14.99,"currency":"USD","period":"P1M","trial":"P1W","prices":[{"amount_micros":14990000,"currency":"USD"}]}]}
  (amount_micros = price × 1,000,000; omit "trial" for none)
- Remove a package:
  DELETE $INTEGRATION_PROXY_URL/internal/revenuecat/projects/544dcbe2-7d2c-42fa-a38f-06978f7b284d/products/%24rc_monthly  ($ -> %24)
- Recover identifiers / repopulate .env: re-run the idempotent /setup call.

## Taking purchases LIVE — store-side steps (USER does these; needed only for real store builds)
- Upload App Store Connect API key (.p8) + Google Play service-account JSON to the RevenueCat dashboard.
- Create matching IAP products in App Store Connect + Google Play using the SAME product IDs.
- All steps are documented in the FAQ section of the payments panel.
