# express-protect-maps-middleware [![npm version](https://badge.fury.io/js/express-protect-maps-middleware.svg)](https://www.npmjs.com/package/express-protect-maps-middleware) [![Build Status](https://travis-ci.org/Tickaroo/express-protect-maps-middleware.svg?branch=master)](https://travis-ci.org/Tickaroo/express-protect-maps-middleware) [![codecov.io](https://codecov.io/github/Tickaroo/express-protect-maps-middleware/coverage.svg?branch=master)](https://codecov.io/github/Tickaroo/express-protect-maps-middleware?branch=master)

express middleware that prevents access to sourcemap files

## Install

```bash
$ npm install --save express-protect-maps-middleware
```

## Usage

Below is a example of usage.

```javascript
var express = require('express');
var mapsMiddleware = require('express-protect-maps-middleware');

var app = express();
app.use(mapsMiddleware(['your.company.ip', 'error.monitoring.service.ip']), '/assets/');
```

## Thrown Error Object

Variables provided with the error object:

- `err.status` HTTP statusCode `403`
