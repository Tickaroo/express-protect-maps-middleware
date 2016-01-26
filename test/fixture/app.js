var auth = require('basic-auth');
var express = require('express');
var mapsMiddleware = require('../../');

module.exports = function(htaccess){
  var app = express();

  if (htaccess) {
    app.use(function(req, res, next){
      var userName = 'foo';
      var userPass = 'bar';
      var user = auth(req);
      if (!user || user.name !== userName || user.pass !== userPass) {
        res.set('WWW-Authenticate', 'Basic realm="example"');
        var err = new Error();
        err.status = 401;
        next(err);
        return;
      }
      next();
    });
  }

  app.use(function(req, res, next){
    res.setHeader('Cache-Control', 'public, max-age=' + 21557600);
    next();
  });

  app.use(mapsMiddleware(['your.company.ip', 'error.monitoring.service.ip'], '/assets/'));

  app.get('/', function(req, res, next){
    res.send('home');
  });

  app.get('/my/super.js.map', function(req, res, next){
    res.send('map!');
  });

  app.get('/assets/some.js.map', function(req, res, next){
    res.send('map!');
  });

  app.get('/assets/some.css.map', function(req, res, next){
    res.send('map!');
  });

  app.use(function(err, req, res, next) {
    var detail = err.message || err.text || err.toString();
    res.status(err.status || 500)
    res.send(detail + err.url + err.status);
    next();
  });

  return app;
};
