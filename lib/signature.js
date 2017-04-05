const base64url = require('base64url');
const ed25519 = require('ed25519');
const url = require('url');

const MASTER_KEY = 'PtISNzqQmQPBxNlUw3CdxsWczXbIwyExxlkRqZ7E690';
const SIGNED_HEADERS_KEY = 'x-signed-headers';
const PERMITTED_SKEW_IN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * SignatureError returns the proper status code and type
 */
function SignatureError(reason) {
  Error.captureStackTrace(this, this.constructor);
  this.type = 'unauthorized';
  this.statusCode = 401;
  this.message = 'Invalid request signature';
  this.reason = reason;
}

/**
 * ValidationError returns the proper status code and type
 */
function ValidationError(reason) {
  Error.captureStackTrace(this, this.constructor);
  this.type = 'bad_request';
  this.statusCode = 400;
  this.message = 'Request validation failed';
  this.reason = reason;
}

class Signature {
  /**
   * Create a new signature instance for the given request
   *
   * @constructor
   * @param {object} req - Request object
   */
  constructor(req) {
    this.req = req;

    this.xSignature = (req.headers['x-signature'] || '').split(' ');
    this.signature = base64url.toBuffer(this.xSignature[0] || '');
    this.publicKey = base64url.toBuffer(this.xSignature[1] || '');
    this.endorsement = base64url.toBuffer(this.xSignature[2] || '');

    this.message = this.canonize(this.req);
    console.log(this.message);
    this.date = Date.parse(req.headers.date);
  }

  /**
   * Return whether the request signature is valid for the given master key
   *
   * @param {string} masterKey - Master key base64url string
   * @returns {error}
   */
  test(masterKey) {
    if (this.xSignature.length < 3) {
      return new ValidationError('invalid x-signature length');
    }
    if (this.message.length < 1) {
      return new ValidationError('missing message');
    }
    if (!this.validTime()) {
      return new SignatureError('clock skew');
    }
    if (!this.goodSignature(masterKey)) {
      return new SignatureError('invalid signature');
    }
    return true;
  }

  goodSignature(masterKey) {
    let mk = masterKey;
    if (typeof masterKey === 'string') {
      mk = base64url.toBuffer(mk);
    }
    const goodEndorsement = ed25519.Verify(this.publicKey, this.endorsement, mk);
    return goodEndorsement && ed25519.Verify(this.message, this.sig, this.publicKey);
  }

  validTime() {
    return true;
    const skew = Math.abs(Date.now() - this.date);
    return skew < PERMITTED_SKEW_IN_MS;
  }

  /**
   * Return a canonicalized representation of the request
   *
   * @param {object} req - Request object
   * @returns {string}
   */
  canonize(req) {
    const urlData = url.parse(req.url || '');
    let msg = `${req.method} ${urlData.pathname}`;
    if (urlData.query && urlData.query.length > 0) {
      const qs = urlData.query.split('&').sort().join('&');
      msg += `?${qs}`;
    }
    msg += "\n";

    const signedHeadersGroup = req.headers[SIGNED_HEADERS_KEY] || '';
    const signedHeaders = signedHeadersGroup.split(' ');
    signedHeaders.push(SIGNED_HEADERS_KEY);
    signedHeaders.forEach((h) => {
      const name = h || '';
      const key = name.toLowerCase();
      const value = req.headers[key];
      msg += `${key}: ${value}\n`;
    });

    msg += req.body;
    return msg;
  }
}

class Verifier {
  /**
   * Create a new verifier instance for the given master key
   *
   * @constructor
   * @param {string} masterKey - Master key base64url string
   */
  constructor(givenMasterKey) {
    const masterKey = givenMasterKey || MASTER_KEY;
    this.masterKey = base64url.toBuffer(masterKey);
  }

  /**
   * Return whether the given request's signatures is valid for the master key
   *
   * @param {object} req - Request object
   * @returns {error}
   */
  test(req) {
    if (!this.masterKey) {
      return new ValidationError('missing master key');
    }
    const signature = new Signature(req);
    return signature.test(this.masterKey);
  }
}

module.exports = {
  Signature,
  Verifier,
  ValidationError,
  SignatureError,
  MASTER_KEY,
};
