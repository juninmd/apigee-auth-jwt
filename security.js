// @ts-check
const net = require('net');

const DEFAULT_MAX_REQUESTS = 10;
const DEFAULT_WINDOW_MS = 60 * 1000;

class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;
    this.windowMs = options.windowMs || DEFAULT_WINDOW_MS;
    this.hits = new Map();
  }

  tryConsume(key) {
    const now = Date.now();
    const entry = this.hits.get(key);
    if (!entry || now - entry.resetAt >= this.windowMs) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (entry.count >= this.maxRequests) {
      return false;
    }
    entry.count += 1;
    return true;
  }

  reset() {
    this.hits.clear();
  }
}

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    return false;
  }
  const [a, b] = parts;
  return a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168);
}

function isInternalAddress(hostname) {
  if (typeof hostname !== 'string' || hostname.length === 0) {
    return false;
  }
  const host = hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return true;
  }

  const v4mapped = host.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (v4mapped) {
    return isPrivateIPv4(v4mapped[1]);
  }

  const version = net.isIP(host);
  if (version === 4) {
    return isPrivateIPv4(host);
  }
  if (version === 6) {
    if (host === '::' || host === '::1') {
      return true;
    }
    const firstGroup = host.split(':')[0];
    return /^f[cd]$/.test(firstGroup) || /^fe[89ab]$/.test(firstGroup);
  }
  return false;
}

function validateCredentials(clientId, clientSecret) {
  if (typeof clientId !== 'string' || clientId.trim() === '') {
    throw new TypeError('clientId must be a non-empty string');
  }
  if (typeof clientSecret !== 'string' || clientSecret.trim() === '') {
    throw new TypeError('clientSecret must be a non-empty string');
  }
}

function validateHost(host) {
  if (typeof host !== 'string' || host.trim() === '') {
    throw new TypeError('host must be a non-empty string');
  }

  let url;
  try {
    url = new URL(host.trim());
  } catch {
    throw new TypeError('host must be a valid absolute URL (e.g. https://example.com)');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('host must use the http or https protocol');
  }
  if (url.username || url.password) {
    throw new TypeError('host must not contain embedded credentials');
  }
  if (!url.hostname) {
    throw new TypeError('host must include a hostname');
  }
  if (isInternalAddress(url.hostname)) {
    throw new TypeError('host must not point to an internal or loopback address');
  }
}

function sanitizeError(error) {
  if (!(error instanceof Error)) {
    return new Error('Token request failed');
  }
  const safe = new Error(error.message);
  safe.name = error.name || 'Error';
  if (typeof error.code !== 'undefined') {
    safe.code = error.code;
  }
  if (error.response && typeof error.response.status === 'number') {
    safe.statusCode = error.response.status;
  }
  return safe;
}

module.exports = {
  RateLimiter,
  DEFAULT_MAX_REQUESTS,
  DEFAULT_WINDOW_MS,
  isInternalAddress,
  isPrivateIPv4,
  validateCredentials,
  validateHost,
  sanitizeError
};
