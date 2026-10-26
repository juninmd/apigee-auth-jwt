// @ts-check
const { createHash } = require('crypto');
const { default: axios } = require('axios');
const qs = require('qs');

const cache = require('./cache');

/**
 * One cache entry per host and client id, so tokens never leak across tenants.
 * The client id is hashed so it does not sit in clear in the cache keys.
 * @param {String} host
 * @param {String} clientId
 */
const cacheKeyFor = (host, clientId) =>
  `access-token-apigee:${host}:${createHash('sha256').update(clientId).digest('hex')}`;

/**
 *
 * @param {String} host
 * @param {String} clientId
 * @param {String} clientSecret
 * @returns Bearer Token
 */
async function getToken(host, clientId, clientSecret) {
  const cacheKey = cacheKeyFor(host, clientId);
  let accessToken = cache.get(cacheKey);

  if (accessToken) {
    return accessToken;
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
    // Bounded wait, and no redirects: the body carries the client secret.
    timeout: 10000,
    maxRedirects: 0,
  };

  const { data: { access_token, expires_in } } = await axios.request(config);
  cache.set(cacheKey, access_token, Number(expires_in) - 60);
  return access_token;
}

module.exports = getToken;