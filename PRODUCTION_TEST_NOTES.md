# Production Test Notes

Tested: 2026-07-13 (Asia/Saigon)

Production targets:

- Frontend: https://travel.thatcherdev.id.vn
- API: https://riykkqhge2.execute-api.ap-southeast-2.amazonaws.com
- Vercel project: `hcthanhs-projects-f5541786/travel-platform`

## Confirmed Issues

### P1 - Password recovery is not implemented in the API

- `POST /api/auth/forgot-password` returns HTTP 404.
- `POST /api/auth/reset-password` returns HTTP 404.
- The frontend pages exist, so users can enter the flow but cannot complete it.
- Reproduction: open `/forgot-password`, submit an email, or call either API route directly.

### P2 - Footer links lead to missing pages

- `/about` returns HTTP 404.
- `/contact` returns HTTP 404.
- `/privacy` returns HTTP 404.
- `/terms` returns HTTP 404.
- These links are visible in the footer on every page.

### P1 - Next.js version has a production security warning

- Production builds use Next.js `14.0.4`.
- Vercel reports that this version has a known security vulnerability and recommends upgrading to a patched version.
- Upgrade must include a full frontend regression build and smoke test.

### P2 - Automatic Vercel deployments are not connected to GitHub

- The new Vercel project is deployed and owns the custom domain.
- Vercel cannot connect `CthanhWork/travel-platform-aws` through the currently connected GitHub identity `ThanhDev18` because it lacks repository write/admin access.
- Production deployments currently require a manual Vercel CLI deployment from `frontend`.

## Issue Fixed During Initial Production Check

### Auth state redirected protected pages after a browser refresh

- Previous behavior: login succeeded, but directly loading `/admin`, `/trips`, `/saved`, or `/profile` redirected back to Login.
- Cause: `ProtectedRoute` evaluated the default Zustand state before persisted state hydration completed.
- Fix deployed in commit `4d96fd9`.
- Retest: all four protected routes retain the admin session after full navigation, with no console errors.

## Passing Checks

- Frontend routes `/`, `/places`, `/login`, `/register`, `/trips`, and `/admin` return HTTP 200.
- Place list loads 301 records.
- Place detail renders JSON opening hours as readable text without React error #31.
- Admin login and current-user profile API pass.
- Places list, search, detail, and reviews list APIs pass.
- Saved Places list API passes.
- Trips list API passes.
- My Bookings, My Claims, Pending Claims, and Admin Dashboard APIs pass.
- Temporary trip create/get/update/delete flow passes, including start and end dates.
- Temporary save/unsave place flow passes.
- Temporary review create/helpful vote/delete flow passes.
- Temporary booking create/cancel flow passes.
- Admin, Trips, Saved, and Profile pages load after login and full navigation.
- No React application error or browser console error was observed on tested screens.

## Coverage Gaps

- Registration UI was not submitted to avoid creating another production account.
- Business Owner dashboard UI was not tested because the test account is an Admin, not a Business Owner.
- Email delivery cannot be tested until password recovery endpoints are implemented and SES sender configuration is confirmed.
