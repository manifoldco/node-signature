'use strict';

var util = require('util');
var errors = module.exports;

/**
 * InvalidSignature returns the proper status code and type
 */
function InvalidSignature(reason) {
  Error.captureStackTrace(this, this.constructor);
  this.type = 'unauthorized';
  this.statusCode = 401;
  this.message = 'Invalid request signature';
  this.reason = reason;
}
util.inherits(InvalidSignature, Error);

errors.InvalidSignature = InvalidSignature;

/**
 * ValidationFailed returns the proper status code and type
 */
function ValidationFailed(reason) {
  Error.captureStackTrace(this, this.constructor);
  this.type = 'bad_request';
  this.statusCode = 400;
  this.message = 'Request validation failed';
  this.reason = reason;
}
util.inherits(ValidationFailed, Error);

errors.ValidationFailed = ValidationFailed;
