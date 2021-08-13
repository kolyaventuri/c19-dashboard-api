import AWS from 'aws-sdk';
import mock from './mock-aws';

const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  console.warn('aws-sdk has been mocked');
}

const sdk: typeof AWS = isProd ? AWS : mock as typeof AWS;

export default sdk;
