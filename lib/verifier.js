'use strict';

var verifier = module.exports;

var Promise = require('es6-promise').Promise;
var base64url = require('base64url');

var cb = require('./cb');
var errors = require('./errors');
var Signature = require('./signature').Signature;

// MASTER_KEY is Manifold's public master signing key, base64 encoded.
var MASTER_KEY = 'PtISNzqQmQPBxNlUw3CdxsWczXbIwyExxlkRqZ7E690';
verifier.MASTER_KEY = MASTER_KEY;

/**
 * Create a new verifier instance for the given master key
 *
 * @constructor
 * @param {string} masterKey - Master key base64url string
 */
function Verifier(givenMasterKey) {
  var masterKey = givenMasterKey || MASTER_KEY;
  if (!masterKey) {
    throw new errors.ValidationFailed('invalid master key');
  }
  this.masterKey = base64url.toBuffer(masterKey);
}

/**
 * Return whether the given request's signatures is valid for the master key
 *
 * @param {object} req - Request object
 * @param {buffer} buf - Raw body buffer (optional)
 * @param {function} callback - Callback function (otherwise, return promise)
 * @returns {promise}
 */
Verifier.prototype.test = function(req, buf, callback) {
  if (typeof buf === 'function') {
    callback = buf;
    buf = null;
  }
  return cb.wrap(this._test(req, buf), callback);
};

Verifier.prototype._test = function(req, buf) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (!self.masterKey) {
      return reject(new errors.ValidationFailed('missing master key'));
    }
    var signature = new Signature(req, buf);
    signature.test(self.masterKey).then(resolve).catch(reject);
  });
};

verifier.Verifier = Verifier;
