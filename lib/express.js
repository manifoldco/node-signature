const Verifier = require('./signature').Verifier;
const ValidationError = require('./signature').ValidationError;
const SignatureError = require('./signature').SignatureError;

const DEFAULT_STATUS_CODE = 500;
const DEFAULT_MESSAGE = 'Unknown error during signature verification';

const DEFAULT_APPEND_PROPERTY = '_requestSignatureValid';

function respond(userParams, req, res, next) {
  const params = userParams || {};
  const opts = params.opts || {};
  const message = params.message || DEFAULT_MESSAGE;
  const statusCode = params.statusCode || DEFAULT_STATUS_CODE;

  // Append the result to the request object, so they can handle the response
  if (opts.skipResponse) {
    // Allow them to choose the name of the param, otherwise default
    req[opts.appendResult || DEFAULT_APPEND_PROPERTY] = userParams.result;
    return next();
  }

  // If valid, continue to handler
  if (userParams.result === true) {
    return next();
  }

  // Otherwise respond with the message supplied
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.send(JSON.stringify({
    message,
  }));
}

module.exports = function middleware(userOpts) {
  const opts = userOpts || {};
  const verifier = new Verifier(opts.masterKey);
  return function expressMiddleware(req, res, next) {
    let message;
    let statusCode;
    let result = true;

    const err = verifier.test(req);
    if (err instanceof SignatureError || err instanceof ValidationError) {
      message = err.message;
      statusCode = err.statusCode;
      result = false;
    }

    return respond({
      message,
      statusCode,
      opts,
      result,
    }, req, res, next);
  };
};
