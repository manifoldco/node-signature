const Signature = require('./lib/signature').Signature;
const Verifier = require('./lib/signature').Verifier;
const MASTER_KEY = require('./lib/signature').MASTER_KEY;
const express = require('./lib/express');

module.exports = {
  Signature,
  Verifier,
  MASTER_KEY,
  express,
};
