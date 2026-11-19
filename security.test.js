const { RateLimiter } = require('./security');

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
