'use strict';

var express = module.exports;

var Verifier = require('../verifier').Verifier;

var RESULT_KEY_DEFAULT = 'manifoldInvalidSignature';
var STATUS_CODE_DEFAULT = 500;

express.appendRawBody = function(req, res, buf) {
  req.rawBody = buf;
};

express.middleware = function(opts) {
  opts = opts || {};
  var verifier = new Verifier(opts.masterKey);
  return function(req, res, next) {
    verifier.test(req, req.rawBody)
    .then(function() {
      next();
    })
    .catch(function(err) {
      // User will handle responding to the request
      if (opts.autoRespond === false) {
        req[opts.resultKey || RESULT_KEY_DEFAULT] = err;
        return next();
      }
      // Respond to the request with the appropriate error
      res.statusCode = err.statusCode || STATUS_CODE_DEFAULT;
      res.json({
        message: err.message
      });
    });
  };
};
