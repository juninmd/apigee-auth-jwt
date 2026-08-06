// @ts-check
const { default: axios } = require('axios');
const qs = require('qs');

const cache = require('./cache');
const {
  RateLimiter,
  validateCredentials,
  validateHost,
  sanitizeError
} = require('./security');

const tokenRateLimiter = new RateLimiter();
const CACHE_KEY = 'access-token-apigee';
const DEFAULT_TTL_SECONDS = 3600;

/**
 * @param {String} host
 * @param {String} clientId
 * @param {String} clientSecret
 * @returns Bearer Token
 */
async function getToken(host, clientId, clientSecret) {
  validateHost(host);
  validateCredentials(clientId, clientSecret);

  let accessToken = cache.get(CACHE_KEY);

  if (accessToken) {
    return accessToken;
  }

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

  const expiresIn = Number(data.expires_in);
  const ttl = Number.isFinite(expiresIn) && expiresIn > 60 ? expiresIn - 60 : DEFAULT_TTL_SECONDS - 60;
  cache.set(CACHE_KEY, data.access_token, ttl);
  return data.access_token;
}

module.exports = getToken;
module.exports.tokenRateLimiter = tokenRateLimiter;
