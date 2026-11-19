# Khata (offline-first loan ledger)

## Run it
1. Install Node.js 20+ from nodejs.org
2. In this folder: `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase URL and key (used from the sync step)
4. `npm run dev` and open the address it prints
5. `npm test` runs the loan-calculation tests

## Folders
- `src/logic/`  pure calculations (dates, schedule, pending, profit) + tests
- `src/lib/`    local database (Dexie) and Supabase client
- `src/data/`   all reads/writes; every write also queues a sync marker
- `src/App.jsx` temporary screen to prove offline storage works

## Roadmap
3. Real screens (Today, Customers, Loan detail, loan form)
4. Sync with Supabase
5. Login and plan check
6. Android APK with Capacitor
