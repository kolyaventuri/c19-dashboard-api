import AWS from 'aws-sdk';

const endpoint = process.env.DYNAMO_URL;
const options = endpoint ? {endpoint} : {};

export const db = new AWS.DynamoDB.DocumentClient(options);
export const _db = (extra = {}): AWS.DynamoDB => new AWS.DynamoDB({...options, ...extra});

export const tables: {cache: string} = {
  cache: process.env.DYNAMO_TABLE!,
};
