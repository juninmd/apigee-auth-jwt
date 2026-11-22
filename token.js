// @ts-check
const { default: axios } = require('axios');
const crypto = require('crypto');
const qs = require('qs');

const cache = require('./cache');
const {
  RateLimiter,
  validateCredentials,
  validateHost,
  sanitizeError
} = require('./security');

const tokenRateLimiter = new RateLimiter();
const CACHE_KEY_PREFIX = 'access-token-apigee';
const DEFAULT_TTL_SECONDS = 3600;
const REQUEST_TIMEOUT_MS = 10 * 1000;
/** @type {Map<string, Promise<string>>} */
const inFlight = new Map();

// One token per host + credentials; the secret only enters the key as a hash.
function cacheKey(host, clientId, clientSecret) {
  const digest = crypto
    .createHash('sha256')
    .update(JSON.stringify([host.trim(), clientId, clientSecret]))
    .digest('hex');
  return `${CACHE_KEY_PREFIX}:${digest}`;
}

/**
 * @param {String} host
 * @param {String} clientId
 * @param {String} clientSecret
 * @returns Bearer Token
 */
async function getToken(host, clientId, clientSecret) {
  validateHost(host);
  validateCredentials(clientId, clientSecret);

  const key = cacheKey(host, clientId, clientSecret);
  const accessToken = cache.get(key);

  if (accessToken) {
    return accessToken;
  }

  // Concurrent callers on a cold cache share one request instead of each
  // spending rate-limit budget (and the 11th failing with 429).
  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }
  const request = requestToken(host, clientId, clientSecret, key);
  inFlight.set(key, request);
  try {
    return await request;
  } finally {
    inFlight.delete(key);
  }
}

async function requestToken(host, clientId, clientSecret, key) {
  if (!tokenRateLimiter.tryConsume(host)) {
    const error = new Error('Too many token requests. Please retry later.');
    error.statusCode = 429;
    throw error;
  }

  const body = qs.stringify({
    'client_id': clientId,
    'client_secret': clientSecret
  });

  const config = {
    baseURL: host,
    url: '/oauth/jwt/client_credential/accesstoken',
    method: 'post',
    timeout: REQUEST_TIMEOUT_MS,
    data: body,
    params: {
      grant_type: 'client_credentials'
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  };

  let data;
  try {
    const response = await axios.request(config);
    data = response.data;
  } catch (error) {
    throw sanitizeError(error);
  }

  if (!data || typeof data.access_token !== 'string' || data.access_token === '') {
    const error = new Error('Token endpoint returned an invalid response');
    error.statusCode = 502;
    throw error;
  }

  const ttl = cacheTtl(Number(data.expires_in));
  // node-cache treats ttl 0 as "never expire", so an expired token is not cached.
  if (ttl > 0) {
    cache.set(key, data.access_token, ttl);
  }
  return data.access_token;
}

// Expire 60 s early, or halfway for tokens that live less than two minutes.
function cacheTtl(expiresIn) {
  if (!Number.isFinite(expiresIn)) {
    return DEFAULT_TTL_SECONDS - 60;
  }
  return Math.floor(expiresIn - Math.min(60, Math.ceil(expiresIn / 2)));
}

module.exports = getToken;
module.exports.tokenRateLimiter = tokenRateLimiter;
module.exports.cacheKey = cacheKey;
