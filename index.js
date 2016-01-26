function isIp(req, safeIps) {
  var clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;
  return clientIp && safeIps && safeIps.indexOf(clientIp) !== -1;
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
};

module.exports = function(safeIps, scopeDir) {
  return [
    function(req, res, next) {
      if (isMapFile(req.url, scopeDir)) {
        resetCache(res);

        if ( ! isIp(req, safeIps)) {
          var err = new Error();
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
