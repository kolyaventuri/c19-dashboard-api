import {it} from 'mocha';
import {expect} from 'chai';
import proxyquire from 'proxyquire';
import sinon, {stub} from 'sinon';
import {healthcheck as realHealthcheck} from '../../src/healthcheck/get';

let healthcheck: typeof realHealthcheck;
let mockPromise: sinon.SinonStub;
beforeEach(() => {
  mockPromise = stub().resolves();
  healthcheck = proxyquire.noCallThru()<{healthcheck: typeof realHealthcheck}>('../../src/healthcheck/get', {
    '../db': {
      db: {
        scan: stub().returns({promise: mockPromise}),
      },
      tables: {},
    },
  }).healthcheck;
});

it('returns a 200 ok response if the DB call passes', async () => {
  const result = await healthcheck({} as AWSLambda.APIGatewayProxyEvent);

  expect(result).to.deep.equal({
    statusCode: 200,
    body: 'page ok',
  });
});

it('returns a 503 response if the DB call fails', async () => {
  mockPromise.rejects();
  const result = await healthcheck({} as AWSLambda.APIGatewayProxyEvent);

  expect(result).to.deep.equal({
    statusCode: 503,
    body: '503 Service Unavailable',
  });
});

