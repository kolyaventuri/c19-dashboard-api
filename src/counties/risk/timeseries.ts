import {cors} from '../../constants/headers';
import runWarm from '../../utils/run-warm';
import AWS from '../../utils/aws-or-mock';

const S3 = new AWS.S3();

const errorResponse = {
  statusCode: 503,
  body: '503 Service Unavailable',
};

export const risk = async (_: AWSLambda.APIGatewayEvent): Promise<AWSLambda.APIGatewayProxyResult> => {
  let result: string;
  try {
    const object = await S3.getObject({
      Bucket: 'c19-dashboard-api-production',
      Key: 'counties/risk-timeseries.json',
    }).promise();
    const dataString = object.Body?.toString();

    if (!dataString) {
      throw new Error('Data is missing!');
    }

    result = dataString;
  } catch (error: unknown) {
    console.error(error);
    return errorResponse;
  }

  return {
    statusCode: 200,
    headers: cors,
    body: result,
  };
};

export const handler = runWarm(risk);
