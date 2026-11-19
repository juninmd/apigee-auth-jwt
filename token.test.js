// @ts-check
const { default: axios } = require('axios');
const cache = require('./cache');
const getToken = require('./token');
const { cacheKey } = getToken;

jest.mock('axios');

const host = 'https://example.com';
const clientId = 'client-id';
const clientSecret = 'client-secret';

describe('getToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache.flushAll();
  });

  it('should return the access token from cache if it exists', async () => {
    const accessToken = 'mock-access-token';
    cache.set(cacheKey(host, clientId, clientSecret), accessToken);

    const result = await getToken(host, clientId, clientSecret);

    expect(result).toEqual(accessToken);
    expect(axios.request).not.toHaveBeenCalled();
  });

  it('should retrieve the access token from the OAuth2 endpoint if it is not in the cache and return it', async () => {
    const accessToken = 'mock-access-token';
    const expiresIn = 3600;
    const tokenResponse = {
      data: {
        access_token: accessToken,
        expires_in: expiresIn
      }
    };
    axios.request.mockResolvedValue(tokenResponse);

    const result = await getToken(host, clientId, clientSecret);

    expect(result).toEqual(accessToken);
    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledWith({
      baseURL: host,
      url: '/oauth/jwt/client_credential/accesstoken',
      method: 'post',
      timeout: 10000,
      data: 'client_id=client-id&client_secret=client-secret',
      params: {
        grant_type: 'client_credentials'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    expect(cache.get(cacheKey(host, clientId, clientSecret))).toEqual(accessToken);
  });

  it('should throw an error if the token endpoint returns an error', async () => {
    const errorMessage = 'Failed to retrieve access token';
    axios.request.mockRejectedValue(new Error(errorMessage));

    await expect(getToken(host, clientId, clientSecret)).rejects.toThrow(errorMessage);
    expect(cache.get(cacheKey(host, clientId, clientSecret))).toBeUndefined();
  });

  it('should not reuse a cached token for different credentials or another host', async () => {
    cache.set(cacheKey(host, clientId, clientSecret), 'token-a');
    axios.request.mockResolvedValue({ data: { access_token: 'token-b', expires_in: 3600 } });

    await expect(getToken(host, 'other-client', clientSecret)).resolves.toBe('token-b');
    await expect(getToken('https://other.example.com', clientId, clientSecret)).resolves.toBe('token-b');
    await expect(getToken(host, clientId, clientSecret)).resolves.toBe('token-a');
    expect(axios.request).toHaveBeenCalledTimes(2);
  });
});
