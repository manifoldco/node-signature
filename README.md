# node-signature

Verify signed HTTP requests from Manifold

[Code of Conduct](./.github/CONDUCT.md) |
[Contribution Guidelines](./.github/CONTRIBUTING.md)

[![GitHub release](https://img.shields.io/github/tag/manifoldco/node-signature.svg?label=latest)](https://github.com/manifoldco/node-signature/releases) [![Travis](https://img.shields.io/travis/manifoldco/node-signature/master.svg)](https://travis-ci.org/manifoldco/node-signature) [![License](https://img.shields.io/badge/license-BSD-blue.svg)](./LICENSE.md)

## Usage

Signature verification can be done manually, or through supplied middleware. If your framework is not supported, let us know!

### Manual

```
const signature = require('@manifoldco/signature');
const verifier = signature.Verifier();
const err = verifier.test(req);
if (err) {
  // Reject the request
}
```

### Express

```
const express = require('express');
const signatureMiddleware = require('@manifoldco/signature').express;

const app = express();

// You can use the default options, where our middleware will properly
// respond to the request for the given scenario (Recommended)
app.use(signatureMiddleware());

// Or use any of the optional config values below
app.use(signatureMiddleware({
  masterKey: 'put master key here', // By default uses the included master key
  appendResult: '_requestSignatureValid', // Append the result under this key
  skipResponse: false,  // Do not respond to the request automatically
});
```
