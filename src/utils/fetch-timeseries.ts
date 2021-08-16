import AWS from './aws-or-mock';

const S3 = new AWS.S3();

interface Timeseries {
  range: string[];
  data: Array<Record<string, any>>;
}

export const fetchTimeseries = async (type: string | null = null): Promise<Timeseries> => {
  const object = await S3.getObject({
    Bucket: 'c19-dashboard-api-production',
    Key: 'counties/timeseries.json',
  }).promise();
  const dataString = object.Body?.toString();

  if (!dataString) {
    throw new Error('Data is missing!');
  }

  const jsonData: Record<string, Array<Record<string, Record<string, number>>>> = JSON.parse(dataString) as Record<string, Array<Record<string, any>>>;
  const newData: typeof jsonData = {range: [], data: []};

  for (let i = 0; i < jsonData.range.length; i++) {
    const length = Object.keys(jsonData.data[i]).length;
    if (length >= 100) {
      newData.range.push(jsonData.range[i]);
      newData.data.push(jsonData.data[i]);
    }
  }

  if (type) {
    // @ts-expect-error - Data might come back filtered
    newData.data = newData.data.map(date => {
      const entries = Object.entries(date);
      const filtered: Record<string, number> = {};
      for (const [fips, values] of entries) {
        filtered[fips] = values[type];
      }

      return filtered;
    });
  }

  return newData;
};
