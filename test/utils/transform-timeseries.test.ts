import CovidActNow from '@kolyaventuri/covid-act-now';
import test from 'ava';
import { transformTimeseries } from '../../src/utils/transform-timeseries';

import inputState from '../mocks/timeseries/state-input.json';
import expectedState from '../mocks/timeseries/state-expected.json';

const client = new CovidActNow('');
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
type ST = ThenArg<ReturnType<typeof client.states.timeseries>>;

test('can transform timeseries state data', t => {
  const result = transformTimeseries<ST, number>(inputState as ST, 'state', 'riskLevels');
  t.deepEqual(result, expectedState);
});
