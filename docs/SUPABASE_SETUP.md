# Enabling Cross-Device Sync & Login (Supabase)

By default this app runs **local-only**: your data is saved in the browser
(`localStorage`) on a single device. To sync across devices (e.g. PC → phone)
with secure login, connect a free Supabase project. The app detects the
configuration automatically — if it's absent, everything keeps working in
local-only mode.

## 1. Create a Supabase project
1. Go to <https://supabase.com> → sign in → **New project**.
2. Pick a name, a strong database password, and a region. Wait for it to finish.

## 2. Create the table + security rules
1. In your project: **SQL Editor** → **New query**.
2. Paste the contents of [`supabase/schema.sql`](../supabase/schema.sql) and click **Run**.

This creates a `user_data` table with **Row Level Security**, so each signed-in
user can only ever read and write their *own* data.

## 3. Get your API credentials
In **Project Settings → API**, copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **Project API keys → `anon` / `public`** → `VITE_SUPABASE_ANON_KEY`

> The `anon` key is designed to be shipped in client code. Real protection comes
> from the Row Level Security policies above — not from hiding the key.

## 4a. Run locally with sync
```bash
cp .env.example .env
# edit .env and paste your two values
npm run dev
```

## 4b. Deploy to GitHub Pages with sync
The deploy workflow injects the values at build time from **repository
variables**:

1. GitHub repo → **Settings → Secrets and variables → Actions → Variables tab**.
2. Add two **repository variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Re-run the **Deploy to GitHub Pages** workflow (Actions tab → Run workflow),
   or push any commit. The next build will be sync-enabled.

## 5. Use it
- Click **Sign In** (top right) → **Create one** to register.
- By default Supabase sends a confirmation email. To skip that during testing:
  **Authentication → Providers → Email → turn off "Confirm email"**.
- Sign in on any device with the same account and your data follows you.

## How sync works
- Your whole app state is stored as a single JSON document per user
  (`user_data.data`), keyed to your account.
- On sign-in the app reconciles local vs. cloud data using **last-write-wins**
  (the most recently modified copy wins), then keeps the cloud copy updated as
  you make changes (debounced, plus on tab switch/close).
- On sign-out, this device's local copy of the synced data is cleared for
  privacy — it remains safe in the cloud and returns when you sign back in.
- Theme (light/dark) is intentionally **not** synced; it stays per-device.

### Note on conflicts
Reconciliation is last-write-wins at the document level. If you edit the *same
account* on two devices while both are offline, the copy saved last will
overwrite the other. For typical single-user, one-device-at-a-time use this is
seamless.
