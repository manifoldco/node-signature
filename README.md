# node-signature

Verify signed HTTP requests from Manifold

[Code of Conduct](./.github/CONDUCT.md) | [Contribution Guidelines](./.github/CONTRIBUTING.md)

[![GitHub release](https://img.shields.io/github/tag/manifoldco/node-signature.svg?label=latest)](https://github.com/manifoldco/node-signature/releases) [![Travis](https://img.shields.io/travis/manifoldco/node-signature/master.svg)](https://travis-ci.org/manifoldco/node-signature) [![License](https://img.shields.io/badge/license-BSD-blue.svg)](./LICENSE.md) [![NPM](https://img.shields.io/npm/v/@manifoldco/signature.svg)](https://npmjs.org/package/@manifoldco/signature)

## Install

```bash
$ npm install @manifoldco/signature
```

## Usage

```js
var Verifier = require('@manifoldco/signature').Verifier;
var verifier = new Verifier();

// Using the promise interface
verifier.test(request).then(function() {
  // Accept and handle request
}).catch(function(err) {
  // Deny request on error
  res.statusCode = err.statusCode || 500;
  // Respond with JSON, including a message property
  return res.json({ message: err.message });
});

// Using the callback interface
verifier.test(request, function(err) {
  if (err) {
    // Deny request on error
    res.statusCode = err.statusCode || 500;
    // Respond with JSON, including a message property
    return res.json({ message: err.message });
  }

  // Accept and handle request
});
```

### Express

```js
var verifier = require('@manifoldco/signature').express;

// When using an existing body parser, we require you to add a verify step
// which will keep track of the original request body for the verifier
// middleware
app.use(bodyParser.json({ verify: verifier.appendRawBody }));

// Applying the verifier middleware with default master key and options (recommended)
app.use(verifier.middleware());

// Using all available options
app.use(verifier.middleware({
  // If autoRespond false, user must inspect req[resultKey]
  // before handling the request and respond accordingly
  autoRespond: false, // default: true
  resultKey: 'sigError', // default: manifoldInvalidSignature
  masterKey: 'user-supplied-master-key',
});
```
