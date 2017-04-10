'use strict';

var assert = require('assert');
var sinon = require('sinon');

var mocks = require('../mocks');
var bootstrap = require('../bootstrap');

var Verifier = require('../../lib/verifier').Verifier;

describe('signature verification', function() {
  var clock;
  var verifier;
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers(mocks.goodDate.getTime());
    verifier = new Verifier(bootstrap.TEST_MASTER_KEY);
  });
  afterEach(function() {
    sandbox.restore();
    clock.restore();
  });

  it('successfully verifies a valid request', function(done) {
    bootstrap.createHttpServer(verifier, done, function(err, server) {
      assert.equal(err, null);
      bootstrap.sendRequest(mocks.goodRequest, function(err, res) {
        server.close();
        assert.equal(err, null);
        assert.strictEqual(res.statusCode, 200);
        done();
      });
    });
  });

  it('rejects a request due to invalid signature header', function(done) {
    bootstrap.createHttpServer(verifier, done, function(err, server) {
      assert.equal(err, null);
      bootstrap.sendRequest(mocks.invalidSignature, function(err, res, body) {
        server.close();
        assert.equal(err, null);
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(body, 'invalid signature size', 'Incorrect error reason');
        done();
      });
    });
  });

  it('rejects a request due to invalid signature values', function(done) {
    bootstrap.createHttpServer(verifier, done, function(err, server) {
      assert.equal(err, null);
      bootstrap.sendRequest(mocks.invalidRequest, function(err, res, body) {
        server.close();
        assert.equal(err, null);
        assert.strictEqual(res.statusCode, 401);
        assert.strictEqual(body, 'invalid signature', 'Incorrect error reason');
        done();
      });
    });
  });

  it('rejects a request due to clock skew', function(done) {
    bootstrap.createHttpServer(verifier, done, function(err, server) {
      assert.equal(err, null);
      bootstrap.sendRequest(mocks.clockSkewRequest, function(err, res, body) {
        server.close();
        assert.equal(err, null);
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(body, 'clock skew', 'Incorrect error reason');
        done();
      });
    });
  });

  it('rejects a request due to missing headers', function(done) {
    bootstrap.createHttpServer(verifier, done, function(err, server) {
      assert.equal(err, null);
      bootstrap.sendRequest(mocks.emptyRequest, function(err, res) {
        server.close();
        assert.equal(err, null);
        assert.strictEqual(res.statusCode, 400);
        done();
      });
    });
  });
});
