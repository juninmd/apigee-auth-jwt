// @ts-check
const { default: axios } = require('axios');

const getToken = require('./token');
const {
  validateCredentials,
  validateHost
} = require('./security');
/**
 *
 * @param {String} host
 * @param {String} clientId
 * @param {String} clientSecret
 * @returns Bearer Token
 */
async function axiosAuth(host, clientId, clientSecret) {
  validateHost(host);
  validateCredentials(clientId, clientSecret);

  const accessToken = await getToken(host, clientId, clientSecret);
  const instance = axios.create({
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  });
  return instance;
}

module.exports = axiosAuth;
