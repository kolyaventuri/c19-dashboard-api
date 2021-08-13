import {cors} from '../constants/headers';
import {fetchTimeseries} from '../utils/fetch-timeseries';
import runWarm from '../utils/run-warm';

const errorResponse = {
  statusCode: 503,
  body: '503 Service Unavailable',
};

interface Data {
  range: string[];
  data: Array<Record<string, number>>;
}

const allowedTypes = new Set(['risk', 'r0', 'density', 'positivity']);
export const risk = async (event: AWSLambda.APIGatewayEvent): Promise<AWSLambda.APIGatewayProxyResult> => {
  const {type = ''} = event.pathParameters ?? {};
  if (!allowedTypes.has(type)) {
    return {
      statusCode: 404,
      headers: cors,
      body: '404',
    };
  }

  const result: Data = {range: [], data: []};

  try {
    const timeseries = await fetchTimeseries(type);
    result.range = timeseries.range;
    result.data = timeseries.data;
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
