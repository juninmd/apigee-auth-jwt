// @ts-check
const { default: axios } = require('axios');
const cache = require('./cache');
const getToken = require('./token');

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
    axios.request.mockResolvedValue({ data: { access_token: accessToken, expires_in: 3600 } });
    await getToken(host, clientId, clientSecret);
    jest.clearAllMocks();

    const result = await getToken(host, clientId, clientSecret);

    expect(result).toEqual(accessToken);
    expect(axios.request).not.toHaveBeenCalled();
  });

  it('should not reuse a cached token across hosts or client ids', async () => {
    axios.request
      .mockResolvedValueOnce({ data: { access_token: 'token-a', expires_in: 3600 } })
      .mockResolvedValueOnce({ data: { access_token: 'token-b', expires_in: 3600 } });

    expect(await getToken('https://a.example.com', 'id-a', 'secret-a')).toEqual('token-a');
    expect(await getToken('https://b.example.com', 'id-b', 'secret-b')).toEqual('token-b');
    expect(axios.request).toHaveBeenCalledTimes(2);
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
      data: 'client_id=client-id&client_secret=client-secret',
      params: {
        grant_type: 'client_credentials'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000,
      maxRedirects: 0
    });
    expect(cache.keys()).toHaveLength(1);
    expect(cache.get(cache.keys()[0])).toEqual(accessToken);
  });

  it('should throw an error if the token endpoint returns an error', async () => {
    const errorMessage = 'Failed to retrieve access token';
    axios.request.mockRejectedValue(new Error(errorMessage));

    await expect(getToken(host, clientId, clientSecret)).rejects.toThrow(errorMessage);
    expect(cache.keys()).toHaveLength(0);
  });
});
