import {db, tables} from '../db';
import runWarm from '../utils/run-warm';

const errorResponse = {
  statusCode: 503,
  body: '503 Service Unavailable',
};

export const healthcheck = async (_: AWSLambda.APIGatewayEvent): Promise<AWSLambda.APIGatewayProxyResult> => {
  try {
    await db.scan({
      TableName: tables.cache,
      Limit: 1,
    }).promise();
  } catch (error: unknown) {
    console.error(error);
    return errorResponse;
  }

  return {
    statusCode: 200,
    body: 'page ok',
  };
};

export const handler = runWarm(healthcheck);
