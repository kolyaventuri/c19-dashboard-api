import {it} from 'mocha';
import {expect} from 'chai';
import proxyquire from 'proxyquire';
import sinon, {stub} from 'sinon';
import {timeseries as realHandler} from '../../../src/states/timeseries';
import createMockClient, {MockClient} from '../../mocks/mock-client';

import stateTimeseriesResult from '../../fixtures/timeseries/state-input.json';

let handler: typeof realHandler;
let transformTimeseries: sinon.SinonStub;
let client: MockClient;
beforeEach(() => {
  client = createMockClient();
  client.states.timeseries.resolves(stateTimeseriesResult);
  transformTimeseries = stub();
  handler = proxyquire.noCallThru()<{timeseries: typeof realHandler}>('../../../src/states/risk/timeseries', {
    '../../c19-client': client,
    '../../utils/transform-timeseries': {transformTimeseries},
  }).timeseries;
});

it('makes a call to the client', async () => {
  await handler({pathParameters: {type: 'risk'}} as any);

  expect(client.states.timeseries).to.have.been.called; // eslint-disable @typescript/no-unused-expressions
});

it('returns the transformed data', async () => {
  const expected = {transformed: true};
  transformTimeseries.returns(expected);

  const result = await handler({pathParameters: {type: 'risk'}} as any);
  expect(transformTimeseries).to.have.been.calledWith(stateTimeseriesResult, 'state', 'riskLevels');
  expect(result).to.deep.equal({
    statusCode: 200,
    body: JSON.stringify(expected),
  });
});
