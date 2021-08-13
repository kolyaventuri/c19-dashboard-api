import AWS from './aws-or-mock';

type FipsData = Record<string, Record<string, number>>;

interface Timeseries {
  range: string[];
  data: FipsData[];
}

const S3 = new AWS.S3();

export const fetchTimeseries = async (): Promise<Timeseries> => {
  const object = await S3.getObject({
    Bucket: 'c19-dashboard-api-production',
    Key: 'counties/timeseries.json',
  }).promise();
  const dataString = object.Body?.toString();

  if (!dataString) {
    throw new Error('Data is missing!');
  }

  const jsonData = JSON.parse(dataString) as Timeseries;
  const newData: Timeseries = {range: [], data: []};

  for (let i = 0; i < jsonData.range.length; i++) {
    const length = Object.keys(jsonData.data[i]).length;
    if (length >= 2000) {
      newData.range.push(jsonData.range[i]);
      newData.data.push(jsonData.data[i]);
    }
  }

  return newData;
}
