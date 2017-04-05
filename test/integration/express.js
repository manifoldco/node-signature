'use strict';

var assert = require('assert');
var sinon = require('sinon');

var mocks = require('../mocks');
var bootstrap = require('../bootstrap');

describe('express middleware', function() {
  var clock;
  var sandbox;
  var server;
  beforeEach(function(done) {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers(mocks.goodDate.getTime());
    bootstrap.createExpressServer(function(err, app) {
      if (err) {
        return done(err);
      }
      server = app;
      done();
    });
  });
  afterEach(function() {
    sandbox.restore();
    clock.restore();
    server.close();
  });

  it('successfully verifies a valid request', function(done) {
    bootstrap.sendRequest(mocks.goodRequest, function(err, res) {
      assert.equal(err, null);
      assert.strictEqual(res.statusCode, 200);
      done();
    });
  });

  it('rejects a request due to invalid signature header', function(done) {
    bootstrap.sendRequest(mocks.invalidSignature, function(err, res, body) {
      assert.equal(err, null);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(body, 'invalid signature size', 'Incorrect error reason');
      done();
    });
  });

  it('rejects a request due to invalid signature values', function(done) {
    bootstrap.sendRequest(mocks.invalidRequest, function(err, res, body) {
      assert.equal(err, null);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(body, 'invalid signature', 'Incorrect error reason');
      done();
    });
  });

  it('rejects a request due to clock skew', function(done) {
    bootstrap.sendRequest(mocks.clockSkewRequest, function(err, res, body) {
      assert.equal(err, null);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(body, 'clock skew', 'Incorrect error reason');
      done();
    });
  });

  it('rejects a request due to missing headers', function(done) {
    bootstrap.sendRequest(mocks.invalidSignature, function(err, res) {
      assert.equal(err, null);
      assert.strictEqual(res.statusCode, 400);
      done();
    });
  });
});
