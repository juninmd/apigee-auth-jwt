// @ts-check
const axiosAuth = require('./axios');
const cache = require('./cache');
const getToken = require('./token');
const { default: axios } = require('axios');

const axiosMock = axios;
axiosMock.create = jest.fn();
axiosMock.create.mockReturnValue(axiosMock);

jest.mock('./token');

describe('axiosAuth', () => {
  const host = 'https://example.com';
  const clientId = 'test-client-id';
  const clientSecret = 'test-client-secret';

  beforeEach(() => {
    jest.clearAllMocks();
    cache.flushAll();
  });

  it('should create an axios instance with Bearer token in Authorization header', async () => {
    const accessToken = 'test-access-token';
    getToken.mockResolvedValueOnce(accessToken);

    const expectedInstance = axios.create({
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const instance = await axiosAuth(host, clientId, clientSecret);
    expect(instance).toEqual(expectedInstance);
  });

  it('should call getToken with the correct parameters', async () => {
    await axiosAuth(host, clientId, clientSecret);
    expect(getToken).toHaveBeenCalledWith(host, clientId, clientSecret);
  });

  it('should set the Authorization header with Bearer token', async () => {
    const accessToken = 'test-access-token';
    getToken.mockResolvedValueOnce(accessToken);

    await axiosAuth(host, clientId, clientSecret);
    expect(axios.create).toHaveBeenCalledWith({
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  });
});
