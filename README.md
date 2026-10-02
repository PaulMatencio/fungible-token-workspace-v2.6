# FungibleToken v2.6 — Midnight DApp (legacy front end)

Next.js 15 / React 19 client for `contract/fungible_token_v2.6.compact` on Midnight **preprod** — the internal
balance/allowance ledger version. It runs on **port 3001**; the native-token (v3) app lives in `../fungible-token-workspace`
(port 3000). Both can run at the same time (separate browser storage per port).

```
npm run dev          # http://localhost:3001
npm test             # vitest (simulator, multisig, services, wallet connector, generators)
npm run build        # production build
npm run compile:contract   # compact 0.31.1 (see midnight.config.json), strips `as JubjubScalar` into contract/.compat/
npm run check:contract -- <address>   # read-only: which circuits are registered on-chain
```

## Differences from v3 (why this is a separate project)
- Balances/allowances live inside the contract (`transfer`, `approve`, `transferFrom`, `selfBurn`); recipients are **token
  accounts** (64 hex, derived from a secret key), not wallet addresses.
- Multisig unused slots are padded with an all-zero point, which the real proof server rejects, so **all 3 approvals are
  required on-chain** even with threshold 2.
- Staged deploy: core circuits `transfer, approve, transferFrom, selfBurn` first, the rest registered afterwards.
- Same wallet connection (Lace / 1AM), local proof server (`127.0.0.1:6300`), identity / authority-key backups, persistent
  multisig drafts and step panels as the v3 app.

Your deployed v2.6 contract on preprod: `8edd96b60f907c94d0e84988a71e573aa3229a391a6fcc1c78b8b5287e6ad054`
(attach to it in Wallet Mode → Build & Deploy → Attach). The deploy-time authority key and token identity key must be in
this browser's storage — **port 3001 is a different origin than 3000**, so import them here (Overview → Your identity).

Shared tooling: `../signer-tools` signs both versions' requests (`burn {account,value}` and `adminReallocate` for v2.6).
