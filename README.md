# apigee-auth-jwt

**Fetches an Apigee OAuth access token with the client-credentials grant, keeps it in memory and reuses it until it is about to expire.**

A small Node.js helper with two entry points: `getToken()` returns the token string, and `axiosAuth()` returns an axios instance that already sends `Authorization: Bearer <token>`. The token stays in process memory, and repeat calls hit the cache instead of the token endpoint.

[![npm version](https://img.shields.io/npm/v/apigee-auth-jwt.svg)](https://www.npmjs.com/package/apigee-auth-jwt)
[![npm downloads](https://img.shields.io/npm/dm/apigee-auth-jwt.svg)](https://www.npmjs.com/package/apigee-auth-jwt)

## What it does

- Requests an access token from Apigee's client-credentials endpoint using `client_id` and `client_secret`.
- Caches the token in memory and serves it from the cache while it is valid.
- Derives the cache lifetime from the endpoint's `expires_in`, with a 60-second safety margin.
- Validates the host and the credentials before any network call.
- Limits token fetches per host (10 per 60 seconds) to avoid hammering the endpoint.
- Returns either a raw token or an axios instance with the `Authorization` header pre-set.

## Requirements

- Node.js >= 18 (`engines` in `package.json`).
- An Apigee application configured for the client-credentials grant, with a client ID and secret.
- Runtime dependencies are installed with the package: `axios`, `node-cache` and `qs`.

## Install

```sh
npm install apigee-auth-jwt
```

## Usage

The host and credentials below are placeholders — use the values from your Apigee application.

```js
const { getToken, axiosAuth } = require('apigee-auth-jwt');

const host = 'https://apigee.example.com';
const clientId = 'your-client-id';
const clientSecret = 'your-client-secret';

async function main() {
  // 1. Just the token
  const token = await getToken(host, clientId, clientSecret);
  console.log(token);

  // 2. An axios instance that already sends the Bearer header
  const client = await axiosAuth(host, clientId, clientSecret);
  const { data } = await client.get('https://apigee.example.com/v1/resource');
  console.log(data);
}

main().catch((error) => {
  console.error(error.message, error.statusCode);
  process.exitCode = 1;
});
```

Calling `getToken()` or `axiosAuth()` again in the same process reuses the cached token, so it makes no new request.

> The axios instance created by `axiosAuth()` only carries the `Authorization` header. It is not bound to the Apigee host, so pass absolute URLs to `client.get()` / `client.post()` unless you set `baseURL` yourself.

## API

### `getToken(host, clientId, clientSecret)`

Returns `Promise<string>` with the access token.

1. Validates `host`, `clientId` and `clientSecret` (throws `TypeError` on invalid input).
2. Returns the cached token if one exists.
3. Applies the rate limit for that host.
4. Sends a `POST` to `{host}/oauth/jwt/client_credential/accesstoken?grant_type=client_credentials`, with `client_id` and `client_secret` in a form-urlencoded body.
5. Stores `access_token` in the cache and returns it.

### `axiosAuth(host, clientId, clientSecret)`

Returns `Promise<AxiosInstance>`. It validates the same inputs, calls `getToken()`, and creates an instance with:

```js
{
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
}
```

### Errors

| Situation | What you get |
|---|---|
| Empty or non-string `clientId` / `clientSecret` | `TypeError` (`clientId must be a non-empty string`, `clientSecret must be a non-empty string`) |
| Host is not an absolute URL, is not `http`/`https`, contains embedded credentials, or has no hostname | `TypeError` |
| Host points to loopback, a private network or a link-local address | `TypeError` (`host must not point to an internal or loopback address`) |
| More than 10 token fetches for the same host inside 60 seconds | `Error` with `statusCode: 429` and message `Too many token requests. Please retry later.` |
| The endpoint responds without a non-empty string `access_token` | `Error` with `statusCode: 502` (`Token endpoint returned an invalid response`) |
| The HTTP request itself fails | A new `Error` with the original `message`, `name`, `code`, and `statusCode` when the response had a status |

## How it works

```text
getToken(host, clientId, clientSecret)
   │
   ├── validateHost / validateCredentials          (security.js)
   ├── cache.get('access-token-apigee')            (cache.js, node-cache)
   ├── RateLimiter.tryConsume(host)                (10 per 60 s)
   ├── POST /oauth/jwt/client_credential/accesstoken
   └── cache.set(token, expires_in - 60)           (fallback: 3540 s)
```

- **One cache entry per process.** The key is the fixed string `access-token-apigee`. The cache is not keyed by host or client ID, so a single process should talk to a single Apigee credential set.
- **TTL.** When `expires_in` is a finite number greater than 60, the cached TTL is `expires_in - 60` seconds. Otherwise the token is cached for 3540 seconds (3600 minus the 60-second margin).
- **Cache first, then rate limit.** A cache hit returns immediately and does not consume a rate-limit slot.
- **Rate limit.** Ten token fetches per host string per 60 seconds, held in a module-level `RateLimiter`. Exceeding it throws a 429 error; there is no automatic retry.
- **Fixed endpoint.** The request path and the `grant_type` query parameter are hard-coded; the library does not accept overrides.

## Host validation

`validateHost()` rejects, before any request:

- non-string or blank values;
- anything that does not parse as an absolute URL, or uses a protocol other than `http:`/`https:`;
- URLs with `username` or `password` embedded;
- loopback and private addresses: `localhost` and `*.localhost`, `0.0.0.0/8`, `10.0.0.0/8`, `127.0.0.0/8`, `169.254.0.0/16`, `172.16.0.0/12`, `192.168.0.0/16`, `::`, `::1`, `fc00::/7` and `fe80::/10` (including IPv4-mapped forms).

One practical consequence: a local Apigee mock on `http://localhost:PORT` is rejected. Point the helper at a hostname that resolves outside those ranges.

## Security notes

- The client secret is sent only in the POST body to the validated host. It is not written to disk by this library.
- Tokens live in process memory only (`node-cache`, default in-memory store). Restarting the process discards them.
- Request errors are rebuilt as a new `Error`; the axios config, headers and request body are not copied into the thrown error.
- The library does not mask tokens when you log them — `getToken()` returns the raw string, so treat your logs accordingly.
- There is no token revocation, no refresh token flow and no persistence across processes.

## Development

```sh
npm install
npm test          # jest --coverage
npm run test:watch
```

`jest.config.js` sets `bail: 1`, `verbose: true` and `testEnvironment: 'node'`. Tests live in `token.test.js`, `axios.test.js` and `cache.test.js`; there is no separate test file for `security.js`.

## CI

| Workflow | Trigger | What it runs |
|---|---|---|
| `validate.yml` | push and pull request on `master` | Shared PR validation from `juninmd/base-actions` (`reusable-validate.yml`) |
| `sast.yml` | push on `main`/`master`, manual | Shared SAST workflow with `fail-semgrep: false` |
| `security.yml` | push on `master`, weekly cron | Shared security scan |
| `dependabot-auto-merge.yml` | `pull_request_target` | Auto-merge for Dependabot PRs when all checks pass |

The repository has no release or publish workflow; merging to `master` does not publish a new npm version.

## Limitations

- **Single cache slot.** Concurrent calls for different hosts or credentials in the same process overwrite each other's token.
- **No in-flight deduplication.** Two concurrent cold calls can both reach the token endpoint before the cache is populated (bounded by the rate limiter).
- **Fixed TTL margin.** The 60-second margin and the 3540-second fallback are constants; there is no option to configure them. If the endpoint reports `expires_in` of 60 seconds or less, the 3540-second fallback can outlive the token.
- **No retry or backoff.** A 429 or a transient network failure is thrown to the caller.
- **Not a JWT verifier.** The library only retrieves and forwards whatever `access_token` Apigee returns; it does not decode, validate or refresh JWTs.
- **No tests for the security helpers.** Host/IP validation and the rate limiter have no dedicated test file.

## Links

- [npm package](https://www.npmjs.com/package/apigee-auth-jwt)
- [Repository](https://github.com/juninmd/apigee-auth-jwt)
- [Issues](https://github.com/juninmd/apigee-auth-jwt/issues)

## License

`package.json` declares MIT, but the repository has **no `LICENSE` file**.
