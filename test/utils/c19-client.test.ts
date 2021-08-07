/* eslint-disable @typescript-eslint/no-extraneous-class */
import CovidActNow from '@kolyaventuri/covid-act-now';

import {it} from 'mocha';
import {expect} from 'chai';
import proxyquire from 'proxyquire';
import {stub} from 'sinon';

const constructorStub = stub();
class Client {
  constructor(...args: any[]) {
    constructorStub(...args);
  }
}

let client: typeof CovidActNow;
beforeEach(() => {
  process.env.COVID_ACT_NOW_KEY = 'abc';

  client = proxyquire<{default: typeof CovidActNow}>('../../src/c19-client', {
    '@kolyaventuri/covid-act-now': Client,
  }).default;
});

it('creates a client', () => {
  expect(constructorStub).to.have.been.calledWith('abc');
  expect(client).to.be.an.instanceOf(Client);
});
