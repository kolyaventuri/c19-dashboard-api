import client from '../c19-client';
import AWS from './aws-or-mock';

interface CountyData {
  range: string[];
  data: Array<Record<string, Record<string, number>>>;
}

export const update = async (): Promise<void> => {
  console.log('Connecting S3...');
  const S3 = new AWS.S3();
  const object = await S3.getObject({
    Bucket: 'c19-dashboard-api-production',
    Key: 'counties/timeseries.json',
  }).promise();

  const dataString = object.Body?.toString();
  if (!dataString) {
    throw new Error('Data is missing!');
  }

  const data = JSON.parse(dataString) as CountyData;

  const countyData: CountyData = {...data};
  console.log('Awaiting counties...');
  const counties = await client.counties();

  let create = false;
  for (const county of counties) {
    const {
      fips,
      riskLevels,
      metrics,
      lastUpdatedDate: date,
    } = county;
    if (!countyData.range.includes(date)) {
      countyData.range.push(date);
      create = true;
    }

    if (create) {
      if (countyData.data.length !== countyData.range.length) {
        countyData.data.push({});
      }

      const index = countyData.data.length - 1;
      countyData.data[index][fips].risk = riskLevels.overall;
      countyData.data[index][fips].r0 = metrics.infectionRate ?? -1;
      countyData.data[index][fips].positivity = metrics.testPositivityRatio ?? -1;
      countyData.data[index][fips].density = metrics.caseDensity ?? -1;
    }
  }

  console.log('Updated data, putting back in S3...');

  await S3.putObject({
    Bucket: 'c19-dashboard-api-production',
    Key: 'counties/timeseries.json',
    Body: JSON.stringify(countyData),
  }).promise();

  console.log('DONE');
};
