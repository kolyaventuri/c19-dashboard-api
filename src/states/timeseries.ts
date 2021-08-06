import client from '../c19-client';
import runWarm from '../utils/run-warm';
import {transformTimeseries} from '../utils/transform-timeseries';

const errorResponse = {
  statusCode: 503,
  body: '503 Service Unavailable',
};

export const getRisk = async (_: AWSLambda.APIGatewayEvent): Promise<AWSLambda.APIGatewayProxyResult> => {
  let result = {};
  try {
    const data = await client.states.timeseries();
    result = transformTimeseries<typeof data, number>(data, 'state', 'riskLevels'); 
  } catch (error: unknown) {
    console.error(error);
    return errorResponse;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

export const risk = runWarm(getRisk);
