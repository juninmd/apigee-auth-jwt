// @ts-check
const axios = require('axios');

const getToken = require('./token');
/**
 *
 * @param {String} host
 * @param {String} clientId
 * @param {String} clientSecret
 * @returns Bearer Token
 */
async function axiosAuth(host, clientId, clientSecret) {
  const accessToken = await getToken(host, clientId, clientSecret);
  const instance = axios.create({
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  });
  return instance;
}

module.exports = axiosAuth;