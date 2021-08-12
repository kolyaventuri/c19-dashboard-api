import {cors} from '../../constants/headers';
import runWarm from '../../utils/run-warm';
import AWS from '../../utils/aws-or-mock';

const S3 = new AWS.S3();

const errorResponse = {
  statusCode: 503,
  body: '503 Service Unavailable',
};

interface Data {
  range: string[];
  data: Array<Record<string, number>>;
}

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

    const jsonData = JSON.parse(dataString) as Data;
    const newData: Data = {range: [], data: []};

    for (let i = 0; i < jsonData.range.length; i++) {
      const length = Object.keys(jsonData.data[i]).length;
      if (length >= 2000) {
        newData.range.push(jsonData.range[i]);
        newData.data.push(jsonData.data[i]);
      }
    }

    result = JSON.stringify(newData);
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
