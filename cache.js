const NodeCache = require('node-cache');

const Cache = (function () {
  return new NodeCache();
})();

module.exports = Cache;
