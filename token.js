// @ts-check
const { default: axios } = require('axios');
const qs = require('qs');

const cache = require('./cache');

/**
 *
 * @param {String} host
 * @param {String} clientId
 * @param {String} clientSecret
 * @returns Bearer Token
 */
async function getToken(host, clientId, clientSecret) {
  let accessToken = cache.get('access-token-apigee');

  if (accessToken) {
    return accessToken;
  }

  const body = qs.stringify({
    'client_id': clientId,
    'client_secret': clientSecret
  });

  const config = {
    baseUrl: host,
    url: '/oauth/client_credential/accesstoken',
    method: 'post',
    data: body,
    query: {
      grant_type: 'client_credentials'
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  };

  const { data: { access_token, expires_in } } = await axios.request(config);
  cache.set('access-token-apigee', access_token, expires_in - 60);
  return access_token;
}

module.exports = getToken;