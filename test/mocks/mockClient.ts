import {stub} from 'sinon';

const createMockClient = () => ({
  states: {
    timeseries: stub().resolves()
  }
});

export type MockClient = ReturnType<typeof createMockClient>;

export default createMockClient;
