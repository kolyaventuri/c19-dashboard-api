import client from '../c19-client';
import {cors} from '../constants/headers';
import runWarm from '../utils/run-warm';
import {transformTimeseries} from '../utils/transform-timeseries';

const errorResponse = {
  statusCode: 503,
  body: '503 Service Unavailable',
};

const allowedTypes = new Set(['risk', 'r0', 'density', 'positivity']);
const keyMap: {[key: string]: string} = {
  r0: 'infectionRate',
  density: 'caseDensity',
  positivity: 'testPositivityRatio',
};

export const timeseries = async (event: AWSLambda.APIGatewayEvent): Promise<AWSLambda.APIGatewayProxyResult> => {
  const {type = ''} = event.pathParameters ?? {};
  if (!allowedTypes.has(type)) {
    return {
      statusCode: 404,
      headers: cors,
      body: '404',
    };
  }

  let result: Record<string, unknown> = {};
  try {
    const data = await client.states.timeseries();
    const key = type === 'risk' ? 'riskLevels' : 'metrics';
    const extraKey = keyMap[type];
    result = transformTimeseries<typeof data>(data, key, 30, extraKey);
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

export const handler = runWarm(timeseries);

