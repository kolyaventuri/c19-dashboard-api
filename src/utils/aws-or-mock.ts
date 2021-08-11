import AWS from 'aws-sdk';
import mock from './mock-aws';

const sdk: typeof AWS = process.env.NODE_ENV === 'production' ? AWS : mock as typeof AWS;

export default sdk;
