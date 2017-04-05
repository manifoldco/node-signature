const httpMocks = require('node-mocks-http');

const Verifier = require('../lib/signature').Verifier;
const ValidationError = require('../lib/signature').ValidationError;

const goodReq = httpMocks.createRequest({
  method: 'PUT',
  url: 'http://127.0.0.1:4567',
  headers: {
    date: '2017-03-05T23:53:08Z',
    host: '127.0.0.1:4567',
    'content-type': 'application/json',
    'content-length': '143',
    'x-signed-headers': 'host date content-type content-length',
    'x-signature': 'Nb9iJZVDFrcf8-dw7AsuSCPtdoxoAr61YVWQe-5b9z_YiuQW73wR7RRsDBPnrBMtXIg_h8yKWsr-ZNRgYbM7CA FzNbTkRjAGjkpwHUbAhjvLsIlAlL_M6EUh5E9OVEwXs qGR6iozBfLUCHbRywz1mHDdGYeqZ0JEcseV4KcwjEVeZtQN54odcJ1_QyZkmHacbQeHEai2-Aw9EF8-Ceh09Cg',
  },
  body: {
    id: '2686c96868emyj61cgt2ma7vdntg4',
    plan: 'low',
    product: 'generators',
    region: 'aws::us-east-1',
    user_id: '200e7aeg2kf2d6nud8jran3zxnz5j',
  },
});

test('successfully verifies a valid request', () => {
  const verifier = new Verifier();
  const err = verifier.test(goodReq);
  expect(err).toBe(null);
});

test('returns a validation error for invalid request', () => {
  const mockReq = httpMocks.createRequest();
  const verifier = new Verifier();
  const err = verifier.test(mockReq);
  expect(err instanceof ValidationError).toBe(true);
});
