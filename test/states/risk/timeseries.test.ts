import {it} from 'mocha';
import {expect} from 'chai';
import proxyquire from 'proxyquire';
import sinon, {stub} from 'sinon';
import {risk as realRisk} from '../../../src/states/risk/timeseries';
import createMockClient, { MockClient } from '../../mocks/mockClient';

import stateTimeseriesResult from '../../fixtures/timeseries/state-input.json';

let risk: typeof realRisk;
let transformTimeseries: sinon.SinonStub;
let client: MockClient;
beforeEach(() => {
  client = createMockClient();
  client.states.timeseries.resolves(stateTimeseriesResult);
  transformTimeseries = stub();
  risk = proxyquire.noCallThru()<{risk: typeof realRisk}>('../../../src/states/risk/timeseries', {
    '../../c19-client': client,
    '../../utils/transform-timeseries': {transformTimeseries}
  }).risk;
});

it('makes a call to the client', async () => {
  await risk({} as AWSLambda.APIGatewayProxyEvent);

  expect(client.states.timeseries).to.have.been.called;
});

it('returns the transformed data', async () => {
  const expected = {transformed: true};
  transformTimeseries.returns(expected);

  const result = await risk({} as AWSLambda.APIGatewayProxyEvent);
  expect(transformTimeseries).to.have.been.calledWith(stateTimeseriesResult, 'state', 'riskLevels');
  expect(result).to.deep.equal({
    statusCode: 200,
    body: JSON.stringify(expected)
  });
});
