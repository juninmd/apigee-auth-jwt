// @ts-check
const { isInternalAddress, validateHost, RateLimiter } = require('./security');

const hostnameOf = (url) => new URL(url).hostname;

describe('isInternalAddress', () => {
  it.each([
    'http://localhost/',
    'http://127.0.0.1/',
    'http://10.0.0.5/',
    'http://172.16.0.1/',
    'http://192.168.1.1/',
    'http://169.254.169.254/',
    'http://100.64.0.1/',
    'http://[::1]/',
    'http://[fc00::1]/',
    'http://[fd12:3456::1]/',
    'http://[fe80::1]/',
    'http://[febf::1]/',
    // the URL parser rewrites these to the hex form (::ffff:7f00:1)
    'http://[::ffff:127.0.0.1]/',
    'http://[::ffff:10.0.0.1]/',
    'http://[::ffff:169.254.169.254]/',
  ])('flags %s as internal', (url) => {
    expect(isInternalAddress(hostnameOf(url))).toBe(true);
  });

  it.each([
    'https://example.com/',
    'http://8.8.8.8/',
    'http://100.128.0.1/',
    'http://[2001:4860:4860::8888]/',
    'http://[fec0::1]/',
    'http://[::ffff:8.8.8.8]/',
  ])('allows %s', (url) => {
    expect(isInternalAddress(hostnameOf(url))).toBe(false);
  });
});

describe('validateHost', () => {
  it('rejects an IPv4-mapped IPv6 loopback host (SSRF)', () => {
    expect(() => validateHost('http://[::ffff:127.0.0.1]/')).toThrow(/internal or loopback/);
  });

  it('rejects a unique-local IPv6 host', () => {
    expect(() => validateHost('https://[fd00::1]')).toThrow(/internal or loopback/);
  });

  it('accepts a public https host', () => {
    expect(() => validateHost('https://example.com')).not.toThrow();
  });
});

describe('RateLimiter window', () => {
  afterEach(() => jest.restoreAllMocks());

  it('allows requests again as soon as the window has elapsed', () => {
    let now = 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 100 });

    expect(limiter.tryConsume('h')).toBe(true);
    expect(limiter.tryConsume('h')).toBe(false);
    now += 100;
    expect(limiter.tryConsume('h')).toBe(true);
  });
});
