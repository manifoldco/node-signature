'use strict';

var cb = module.exports;

cb.wrap = function(promise, cb) {
  var resolve, reject;
  if (cb && typeof cb !== 'function') {
    throw new Error('callback must be a function');
  }
  if (cb) {
    resolve = function() {
      cb();
    };
    reject = cb;
  }
  if (cb) {
    promise.then(resolve)
    .catch(cb);
  } else {
    return promise;
  }
};
