/* eslint-disable @typescript-eslint/no-extraneous-class */
import test from 'ava';
import proxyquire from 'proxyquire';
import {stub} from 'sinon';

const constructorStub = stub();

class Client {
  constructor(...args: any[]) {
    constructorStub(...args);
  }
}

test('creates a client', t => {
  process.env.COVID_ACT_NOW_KEY = 'abc';
  const {default: client} = proxyquire.noCallThru()('../src/c19-client', {
    '@kolyaventuri/covid-act-now': Client,
  });

  t.true(constructorStub.calledWith('abc'));
  t.true(client instanceof Client);
});
