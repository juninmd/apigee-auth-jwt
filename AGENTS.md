# AGENTS.md

`apigee-auth-jwt` is a small Node.js library. It fetches an Apigee OAuth access token with the client-credentials grant, keeps it in memory, and reuses it until it is about to expire.

## Stack
- Node.js >= 18 (CommonJS entry, `index.js`), axios, node-cache, qs
- Tests: Jest 30 with ts-jest and TypeScript types in devDependencies
- Published to npm as `apigee-auth-jwt`; `files` in `package.json` limits the package to the runtime modules

## Commands
- Install: `npm ci` (or `pnpm install --frozen-lockfile`)
- Tests with coverage: `npm test` (runs `jest --coverage`)
- Watch mode: `npm run test:watch`

## Structure
- `index.js`: public API (`getToken()`, `axiosAuth()`)
- `token.js`: token request and expiry handling
- `cache.js`: in-memory token cache (node-cache)
- `axios.js`: axios instance with the `Authorization` header
- `security.js`: host and credential validation, internal-address blocking
- `*.test.js`: Jest suites next to each module
- `docs/`: README images and `docs/tasks/`
- `.trivyignore`: CVE baseline for the SAST gate

## Conventions
- Keep each file at or under 180 lines. Current maximum: `security.js` at 143.
- Aim for 80% test coverage. The Jest config does not enforce a threshold, so check the `--coverage` report yourself.
- Validate host and credentials before any network call.
- Do not add features beyond the current need.
- Do not commit `.env`, keys, certificates or client secrets. `.gitignore` blocks them.
- Changes go through code review before merge.

## Gotchas
- Two lockfiles are committed: `package-lock.json` and `pnpm-lock.yaml`. `packageManager` pins pnpm@10.34.5. Do not hand-edit either; regenerate with the package manager you use.
- `.trivyignore` holds the known-CVE baseline. New vulnerabilities fail the SAST gate; add an entry only with a reason.
- `docs/tasks/modernization-for-juninmd-apigee-auth-jwt.md` describes a TypeScript migration, but the source files are still `.js`. Treat it as historical, not as current state.
- CI calls reusable workflows from `juninmd/base-actions` (`validate`, `sast`).

<!-- base-actions-main-policy -->
## GitHub Actions — padrão obrigatório (@main)

- Referencie as actions internas sempre pelo branch, nunca por SHA:
  - `uses: juninmd/base-actions/<action>@main`
  - `uses: juninmd/base-actions/.github/workflows/<arquivo>.yml@main`
- Não fixe `@<sha>` em `juninmd/base-actions`: a atualização é centralizada no
  `main` e passa a valer no próximo run.
- PRs cujos checks não iniciam por billing/spending limit são mesclados pelo bot central
  `juninmd/base-actions/.github/workflows/auto-merge-billing-blocked.yml`.
  Para impedir o merge automático de um PR, aplique a label `do-not-merge`.
