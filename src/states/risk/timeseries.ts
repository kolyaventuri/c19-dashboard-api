import client from '../../c19-client';
import {cors} from '../../constants/headers';
import runWarm from '../../utils/run-warm';
import {transformTimeseries} from '../../utils/transform-timeseries';

const errorResponse = {
  statusCode: 503,
  body: '503 Service Unavailable',
};

export const risk = async (_: AWSLambda.APIGatewayEvent): Promise<AWSLambda.APIGatewayProxyResult> => {
  let result: Record<string, unknown> = {};
  try {
    const data = await client.states.timeseries();
    result = transformTimeseries<typeof data>(data, 'riskLevels', 30);
  } catch (error: unknown) {
    console.error(error);
    return errorResponse;
  }

  return {
    statusCode: 200,
    headers: cors,
    body: JSON.stringify(result),
  };
};

export const handler = runWarm(risk);

