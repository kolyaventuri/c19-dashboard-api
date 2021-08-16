import {it} from 'mocha';
import {expect} from 'chai';
import proxyquire from 'proxyquire';
import sinon, {stub} from 'sinon';
import {risk as realRisk} from '../../../src/counties/timeseries';

import countyData from '../../fixtures/timeseries/counties-expected.json';

let risk: typeof realRisk;
let mockS3GetObject: sinon.SinonStub;
let env: string;

before(() => {
  env = process.env.NODE_ENV!;
});

after(() => {
  process.env.NODE_ENV = env;
});

beforeEach(done => {
  process.env.NODE_ENV = 'production';
  mockS3GetObject = stub().resolves({
    Body: {
      toString: () => JSON.stringify(countyData),
    },
  });

  class S3 {
    getObject(...args: any[]) {
      return mockS3GetObject(...args); // eslint-disable @typescript-eslint/no-unsafe-return
    }
  }

  risk = proxyquire.noCallThru()<{risk: typeof realRisk}>('../../../src/counties/risk/timeseries', {
    'aws-sdk': {S3},
  }).risk;

  done();
});

it('makes a call to S3 for the data', async () => {
  await risk({} as AWSLambda.APIGatewayProxyEvent);

  expect(mockS3GetObject).to.have.been.calledWith({
    Bucket: 'c19-dashboard-api-production',
    Key: 'counties/risk-timeseries.json',
  });
});

it('returns the data', async () => {
  const result = await risk({} as AWSLambda.APIGatewayProxyEvent);
  expect(result).to.deep.equal({
    statusCode: 200,
    body: JSON.stringify(countyData),
  });
});

