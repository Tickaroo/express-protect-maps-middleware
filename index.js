function isIp(req, safeIps) {
  var clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;
  if (clientIp && safeIps) {
    if (typeof safeIps === 'string') {
      return clientIp.indexOf(safeIps) !== -1;
    }
    for (var i = 0; i < safeIps.length; i++) {
      if (clientIp.indexOf(safeIps[i]) !== -1) {
        return true;
      }
    }
  }
  return false;
}

function resetCache(res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
}

function isMapFile(url, scopeDir) {
  if (scopeDir && !(new RegExp('^'+scopeDir).test(url))) {
    return;
  }
  return url.indexOf('.js.map') !== -1 || url.indexOf('.css.map') !== -1;
}

module.exports = function(safeIps, scopeDir) {
  return [
    function(req, res, next) {
      if (isMapFile(req.url, scopeDir)) {
        resetCache(res);

        if ( ! isIp(req, safeIps)) {
          var err = new Error('sourcemap file access denied');
          err.status = 403;
          next(err);
          return;
        }
      }
      next();
    },
    function(err, req, res, next) {
      if (isMapFile(req.url, scopeDir)) {
        resetCache(res);

        if (isIp(req, safeIps)) {
          res.removeHeader('WWW-Authenticate');
          next();
          return;
        }
      }
      next(err);
    }
  ];
};
