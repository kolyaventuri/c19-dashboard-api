import {it} from 'mocha';
import {expect} from 'chai';

import CovidActNow from '@kolyaventuri/covid-act-now';
import {transformTimeseries} from '../../src/utils/transform-timeseries';

import inputState from '../fixtures/timeseries/state-input.json';
import expectedState from '../fixtures/timeseries/state-expected.json';

const client = new CovidActNow('');
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
type ST = ThenArg<ReturnType<typeof client.states.timeseries>>;

it('can transform timeseries state data', () => {
  // @ts-expect-error - Ignore typing, check functionality instead
  const result = transformTimeseries<ST, number>(inputState as ST, 'state', 'riskLevels');
  expect(result).to.deep.equal(expectedState);
});
