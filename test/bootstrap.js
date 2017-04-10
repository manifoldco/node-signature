'use strict';

var bootstrap = module.exports;

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var getRawBody = require('raw-body');

var signatureVerify = require('../lib/express');

var TEST_MASTER_KEY = 'jj4tA4PDmEhYGBkUNwvfNzMW703D9nRGtp4U9S5b5nM';
bootstrap.TEST_MASTER_KEY = TEST_MASTER_KEY;

bootstrap.createHttpServer = function(verifier, done, cb) {
  // Test server instance
  var server = http.createServer(function(req, res) {

    // Run the verifier on the inbound request
    return verifier.test(req)
    .then(function() {
      // If it succeeds, end the request
      // status=200
      req.resume();
      res.end();
    })
    .catch(function(err) {
      // If it fails, return the message
      // status=400|401
      res.statusCode = err.statusCode;
      res.end(err.reason);
    });
  });

  // Fail the test case on server error
  server.on('error', done);

  // Listen on 3000, to match mock signed request
  server.listen(3000, function(err) {
    cb(err, server);
  });
};

bootstrap.createExpressServer = function(cb) {
  var app = express();

  app.use(bodyParser.json({
    verify: signatureVerify.appendRawBody,
  }));

  app.all('*', signatureVerify.middleware({
    autoRespond: false,
    masterKey: TEST_MASTER_KEY,
  }), function(req, res) {
    if (req.manifoldInvalidSignature) {
      var err = req.manifoldInvalidSignature;
      res.statusCode = err.statusCode;
      return res.end(err.reason);
    }
    res.end();
  });

  var server = app.listen(3000, function(err) {
    cb(err, server);
  });
};

bootstrap.sendRequest = function(opts, cb) {
  var req = http.request(opts);
  var body = JSON.stringify(opts.body)+"\n";
  req.write(body);
  req.on('response', function(res) {
    getRawBody(res, { encoding: true }, function(err, txt) {
      cb(err, res, txt);
    });
  });
};
