const cache = require('./cache'); // assuming the code is in a file named "Cache.js"

describe('Cache', () => {
  afterEach(() => {
    cache.flushAll();
  });

  test('can set and get values', () => {
    cache.set('key', 'value');
    const result = cache.get('key');
    expect(result).toBe('value');
    const resultB = cache.get('key');
    expect(resultB).toBe('value');
  });

  test('can delete values', () => {
    cache.set('key', 'value');
    cache.del('key');
    const result = cache.get('key');
    expect(result).toBeUndefined();
  });
});
