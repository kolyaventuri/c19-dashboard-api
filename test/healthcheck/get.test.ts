import test from 'ava';
import sinon, {stub} from 'sinon';
import proxyquire from 'proxyquire';

const prom: sinon.SinonStub = stub().resolves();
const {healthcheck} = proxyquire.noCallThru()('../../src/healthcheck/get', {
  '..db': {
    db: {
      scan: stub().returns(prom),
    },
  },
});

test.beforeEach(() => {
  prom.reset();
});

test('returns a 200 ok response if the DB call passes', async t => {
  const result = await healthcheck({} as AWSLambda.APIGatewayProxyEvent);

  t.deepEqual(result, {
    statusCode: 200,
    body: 'page ok',
  });
});

test('returns a 503 response if the DB call fails', async t => {
  prom.rejects();
  const result = await healthcheck({} as AWSLambda.APIGatewayProxyEvent);

  t.deepEqual(result, {
    statusCode: 503,
    body: '503 Service Unavailable',
  });
});

