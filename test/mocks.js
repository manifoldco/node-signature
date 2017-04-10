'use strict';

var mocks = exports;

var httpMocks = require('node-mocks-http');

mocks.goodDate = new Date('2017-04-06T19:17:03Z');

mocks.goodRequest = {
  method: 'PUT',
  host: 'localhost',
  port: 3000,
  path: '/v1/resources/2682z97t9kecmkzqhjztmm3cjynmu',
  headers: {
    date: '2017-04-06T19:17:03Z',
    host: 'localhost:3000',
    'content-type': 'application/json',
    'content-length': '100',
    'x-callback-url': 'http://localhost:5000/v1/callbacks/24ph1gyxrcgrt8a6pyf74bafyfcqr',
    'x-callback-id': '24ph1gyxrcgrt8a6pyf74bafyfcqr',
    'x-signed-headers': 'host date x-callback-id x-callback-url content-type content-length',
    'x-signature': 'GVUY4XJ_VVXg85HZKhFmw7nWjLJfgOk4sNQjZifCe2VDdvdI7AQpt04Nug1dhb-o7RTqdHPE7oftqF0-x0X_BQ Vnj_imuIE6izUaX-_CBvY8x_FDyzGyS_Sf6N6PZZXac 3l8tZHdnQdrrmJtKGX127GbwB5_Ta1oTfE6q5OcDbkph1hsJ8VByN6L5MFkY6C8SMJ4gp4se4tJfNx8DCsY_AQ',
  },
  body: {
    id: '2682z97t9kecmkzqhjztmm3cjynmu',
    plan: 'low',
    product: 'generator',
    region: 'aws::us-east-1',
  },
};

mocks.invalidSignature = httpMocks.createRequest({
  method: 'PUT',
  host: 'localhost',
  port: 3000,
  path: '/v1/resources/2682z97t9kecmkzqhjztmm3cjynmu',
  headers: {
    date: '2017-04-06T19:17:03Z',
    host: 'localhost:3000',
    'content-type': 'application/json',
    'content-length': '100',
    'x-callback-url': 'http://localhost:5000/v1/callbacks/24ph1gyxrcgrt8a6pyf74bafyfcqr',
    'x-callback-id': '24ph1gyxrcgrt8a6pyf74bafyfcqr',
    'x-signed-headers': 'host date x-callback-id x-callback-url content-type content-length',
    'x-signature': 'this isnot asignature',
  },
  body: {
    id: '2682z97t9kecmkzqhjztmm3cjynmu',
    plan: 'low',
    product: 'generator',
    region: 'aws::us-east-1',
  },
});

mocks.invalidRequest = httpMocks.createRequest({
  method: 'PUT',
  host: 'localhost',
  port: 3000,
  path: '/v1/resources/2682z97t9kecmkzqhjztmm3cjynmu',
  headers: {
    date: '2017-04-06T19:17:03Z',
    host: 'localhost:3000',
    'content-type': 'not a real content type',
    'content-length': '100',
    'x-callback-url': 'http://localhost:5000/v1/callbacks/24ph1gyxrcgrt8a6pyf74bafyfcqr',
    'x-callback-id': '24ph1gyxrcgrt8a6pyf74bafyfcqr',
    'x-signed-headers': 'host date x-callback-id x-callback-url content-type content-length',
    'x-signature': 'GVUY4XJ_VVXg85HZKhFmw7nWjLJfgOk4sNQjZifCe2VDdvdI7AQpt04Nug1dhb-o7RTqdHPE7oftqF0-x0X_BQ Vnj_imuIE6izUaX-_CBvY8x_FDyzGyS_Sf6N6PZZXac 3l8tZHdnQdrrmJtKGX127GbwB5_Ta1oTfE6q5OcDbkph1hsJ8VByN6L5MFkY6C8SMJ4gp4se4tJfNx8DCsY_AQ',
  },
  body: {
    id: '2682z97t9kecmkzqhjztmm3cjynmu',
    plan: 'low',
    product: 'generator',
    region: 'aws::us-east-1',
  },
});

mocks.clockSkewRequest = httpMocks.createRequest({
  method: 'PUT',
  host: 'localhost',
  port: 3000,
  path: '/v1/resources/2682z97t9kecmkzqhjztmm3cjynmu',
  headers: {
    date: '2017-04-06T19:00:03Z',
    host: 'localhost:3000',
    'content-type': 'not a real content type',
    'content-length': '100',
    'x-callback-url': 'http://localhost:5000/v1/callbacks/24ph1gyxrcgrt8a6pyf74bafyfcqr',
    'x-callback-id': '24ph1gyxrcgrt8a6pyf74bafyfcqr',
    'x-signed-headers': 'host date x-callback-id x-callback-url content-type content-length',
    'x-signature': 'GVUY4XJ_VVXg85HZKhFmw7nWjLJfgOk4sNQjZifCe2VDdvdI7AQpt04Nug1dhb-o7RTqdHPE7oftqF0-x0X_BQ Vnj_imuIE6izUaX-_CBvY8x_FDyzGyS_Sf6N6PZZXac 3l8tZHdnQdrrmJtKGX127GbwB5_Ta1oTfE6q5OcDbkph1hsJ8VByN6L5MFkY6C8SMJ4gp4se4tJfNx8DCsY_AQ',
  },
  body: {
    id: '2682z97t9kecmkzqhjztmm3cjynmu',
    plan: 'low',
    product: 'generator',
    region: 'aws::us-east-1',
  },
});

mocks.emptyRequest = httpMocks.createRequest({
  method: 'PUT',
  host: 'localhost',
  port: 3000,
});
