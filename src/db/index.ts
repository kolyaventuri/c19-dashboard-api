import AWS from 'aws-sdk';

const endpoint = process.env.DYNAMO_URL;
const opts = endpoint ? {endpoint} : {};

export const db = new AWS.DynamoDB.DocumentClient(opts);
export const _db = (extra = {}): AWS.DynamoDB => new AWS.DynamoDB({...opts, ...extra});

export const tables: {cache: string} = {
  cache: process.env.DYNAMO_TABLE as string
};
