'use strict';

var signature = module.exports;

var Promise = require('es6-promise').Promise;
var base64url = require('base64url');
var ed25519 = require('ed25519');
var url = require('url');

var cb = require('./cb');
var errors = require('./errors');

var SIGNED_HEADERS_KEY = 'x-signed-headers';
var PERMITTED_SKEW_IN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Create a new signature instance for the given request
 *
 * @constructor
 * @param {object} req - Request object
 */
function Signature(req, buf) {
  this.req = req;
  this.rawBody = buf || req.rawBody;

  this.xSignature = (req.headers['x-signature'] || '').split(' ');
  this.signature = base64url.toBuffer(this.xSignature[0] || '');
  this.publicKey = base64url.toBuffer(this.xSignature[1] || '');
  this.endorsement = base64url.toBuffer(this.xSignature[2] || '');

  this.date = Date.parse(req.headers.date);
}

/**
 * Return whether the request signature is valid for the given master key
 *
 * @param {string} masterKey - Master key base64url string
 * @param {function} callback - Callback function (otherwise, return promise)
 * @returns {promise}
 */
Signature.prototype.test = function(masterKey, callback) {
  if (!masterKey) {
    throw new errors.ValidationFailed('invalid master key');
  }
  return cb.wrap(this._test(masterKey, callback));
};

Signature.prototype._test = function(masterKey) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.xSignature.length < 3) {
      return reject(new errors.ValidationFailed('invalid x-signature length'));
    }
    if (!self._validTime()) {
      return reject(new errors.ValidationFailed('clock skew'));
    }

    // Create an canonicalized message
    return self._canonize(self.req)
    // Validate the inbound properties
    .then(function(msg) {
      if (msg.length < 1) {
        throw new errors.ValidationFailed('missing message');
      }
      self.message = msg;
    })
    // Verify the signature using the given masterKey
    .then(function() {
      return self._goodSignature(masterKey);
    })
    .then(resolve)
    .catch(function(err) {
      if (err instanceof errors.ValidationFailed) {
        reject(err);
      } else {
        reject(new errors.InvalidSignature('invalid signature'));
      }
    });
  });
};

Signature.prototype._goodSignature = function(masterKey) {
  var self = this;
  return new Promise(function(resolve) {
    var message = new Buffer(self.message);
    var mk = masterKey;
    if (typeof masterKey === 'string') {
      mk = base64url.toBuffer(mk);
    }
    if (!self._validBuffers(mk)) {
      throw new Error('invalid signature size');
    }
    if (!ed25519.Verify(self.publicKey, self.endorsement, mk)) {
      throw new Error('failed to verify endorsement');
    }
    if (!ed25519.Verify(message, self.signature, self.publicKey)) {
      throw new Error('failed to verify signature');
    }
    resolve();
  });
};

Signature.prototype._validBuffers = function(mk) {
  var invalidEndorsement = !this.endorsement || this.endorsement.length !== 64;
  var invalidMk = !mk || mk.length !== 32;
  var invalidSig = !this.signature || this.signature.length !== 64;
  var invalidPk = !this.publicKey || this.publicKey.length !== 32;
  if (invalidEndorsement || invalidMk || invalidSig || invalidPk) {
    return false;
  }
  return true;
};

Signature.prototype._validTime = function() {
  var skew = Math.abs(new Date() - this.date);
  return skew < PERMITTED_SKEW_IN_MS;
};

Signature.prototype._canonize = function(req) {
  var self = this;
  return new Promise(function(resolve, reject) {
    // Canonize the parameters of the request
    self._canonizeOptions(req)
    .then(function(msg) {
      // Append the body to the message and return
      if (self.rawBody) {
        msg += self.rawBody;
      }
      return msg;
    })
    .then(resolve)
    .catch(reject);
  });
};

Signature.prototype._canonizeOptions = function(req) {
  var urlData = url.parse(req.url || '');
  var msg = req.method.toLowerCase() + ' ' + urlData.pathname;
  if (urlData.query && urlData.query.length > 0) {
    var qs = urlData.query.split('&').sort().join('&');
    msg += '?' + qs;
  }
  msg += '\n';

  var signedHeadersGroup = req.headers[SIGNED_HEADERS_KEY] || '';
  var signedHeaders = signedHeadersGroup.split(' ');
  signedHeaders.push(SIGNED_HEADERS_KEY);
  signedHeaders.forEach(function(h) {
    var name = h || '';
    var key = name.toLowerCase();
    var value = req.headers[key];
    msg += key + ': ' + value + '\n';
  });
  return Promise.resolve(msg);
};

signature.Signature = Signature;
