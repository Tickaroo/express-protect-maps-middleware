var expect = require('chai').expect;
var superagent = require('superagent');
var app = require('./fixture/app.js');

describe('express-protect-maps-middleware', function() {
  this.slow(200);

  describe('no htaccess', function() {
    var server;

    before(function(done) {
      server = app().listen(1234, done);
    });

    after(function() {
      server.close();
    });

    it('should render home', function(done) {
      return superagent.get('http://localhost:1234/').end(function(err, res){
        expect(res.headers['cache-control']).to.equal('public, max-age=21557600');
        expect(res.text).to.equal('home');
        done();
      });
    });

    it('should render not asset included', function(done) {
      return superagent.get('http://localhost:1234/my/super.js.map').end(function(err, res){
        expect(res.headers['cache-control']).to.equal('public, max-age=21557600');
        expect(res.text).to.equal('map!');
        done();
      });
    });

    it('should block hackers', function(done) {
      return superagent.get('http://localhost:1234/assets/some.js.map').end(function(err, res){
        expect(res.statusCode).to.equal(403);
        expect(res.headers['cache-control']).to.equal('private, no-cache, no-store, must-revalidate');
        expect(res.text).to.equal('sourcemap file access deniedundefined403');
        done();
      });
    });

    it('should block', function(done) {
      return superagent.get('http://localhost:1234/assets/some.js.map?hacked').end(function(err, res){
        expect(res.statusCode).to.equal(403);
        expect(res.headers['cache-control']).to.equal('private, no-cache, no-store, must-revalidate');
        expect(res.text).to.equal('sourcemap file access deniedundefined403');
        done();
      });
    });

    it('should unblock with right ip', function(done) {
      return superagent
      .get('http://localhost:1234/assets/some.js.map')
      .set('x-forwarded-for', 'your.company.ip')
      .end(function(err, res){
        expect(res.statusCode).to.equal(200);
        expect(res.headers['cache-control']).to.equal('private, no-cache, no-store, must-revalidate');
        expect(res.text).to.equal('map!');
        done();
      });
    });

    it('should unblock with right ip for css to', function(done) {
      return superagent
      .get('http://localhost:1234/assets/some.css.map')
      .set('x-forwarded-for', 'your.company.ip')
      .end(function(err, res){
        expect(res.statusCode).to.equal(200);
        expect(res.headers['cache-control']).to.equal('private, no-cache, no-store, must-revalidate');
        expect(res.text).to.equal('map!');
        done();
      });
    });
  });

  describe('with string config', function() {
    var server;

    before(function(done) {
      server = app(false, true).listen(1234, done);
    });

    after(function() {
      server.close();
    });

    it('should unblock', function(done) {
      return superagent
      .get('http://localhost:1234/assets/some.css.map')
      .set('x-forwarded-for', 'string.company.ip')
      .end(function(err, res){
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.equal('map!');
        done();
      });
    });
  });

  describe('without config', function() {
    var server;

    before(function(done) {
      server = app(false, false, true).listen(1234, done);
    });

    after(function() {
      server.close();
    });

    it('should block', function(done) {
      return superagent
      .get('http://localhost:1234/assets/some.css.map')
      .set('x-forwarded-for', 'string.company.ip')
      .end(function(err, res){
        expect(res.statusCode).to.equal(403);
        expect(res.text).to.equal('sourcemap file access deniedundefined403');
        done();
      });
    });
  });

  describe('with htaccess', function() {
    var server;
    var auth = 'Basic ' + new Buffer('foo:bar').toString('base64');

    before(function(done) {
      server = app(true).listen(1234, done);
    });

    after(function() {
      server.close();
    });

    it('should not render home', function(done) {
      return superagent
      .get('http://localhost:1234/')
      .end(function(err, res){
        expect(res.statusCode).to.equal(401);
        expect(res.text).to.equal('Errorundefined401');
        done();
      });
    });

    it('should render home', function(done) {
      return superagent
      .get('http://localhost:1234/')
      .set('authorization', auth)
      .end(function(err, res){
        expect(res.headers['cache-control']).to.equal('public, max-age=21557600');
        expect(res.text).to.equal('home');
        done();
      });
    });

    it('should render not asset included', function(done) {
      return superagent.get('http://localhost:1234/my/super.js.map').end(function(err, res){
        expect(res.statusCode).to.equal(401);
        done();
      });
    });

    it('should block', function(done) {
      return superagent.get('http://localhost:1234/assets/some.js.map').end(function(err, res){
        expect(res.statusCode).to.equal(401);
        done();
      });
    });

    it('should unblock with right ip', function(done) {
      return superagent
      .get('http://localhost:1234/assets/some.js.map')
      .set('x-forwarded-for', 'your.company.ip')
      .end(function(err, res){
        expect(res.statusCode).to.equal(200);
        expect(res.headers['cache-control']).to.equal('private, no-cache, no-store, must-revalidate');
        expect(res.text).to.equal('map!');
        done();
      });
    });

    it('should unblock with right ip for ", " ip strings', function(done) {
      return superagent
      .get('http://localhost:1234/assets/some.css.map')
      .set('x-forwarded-for', 'some.other.ip, your.company.ip')
      .end(function(err, res){
        expect(res.statusCode).to.equal(200);
        expect(res.headers['cache-control']).to.equal('private, no-cache, no-store, must-revalidate');
        expect(res.text).to.equal('map!');
        done();
      });
    });

    it('should unblock with right ip for css too', function(done) {
      return superagent
      .get('http://localhost:1234/assets/some.css.map')
      .set('x-forwarded-for', 'your.company.ip')
      .end(function(err, res){
        expect(res.statusCode).to.equal(200);
        expect(res.headers['cache-control']).to.equal('private, no-cache, no-store, must-revalidate');
        expect(res.text).to.equal('map!');
        done();
      });
    });
  });


});
