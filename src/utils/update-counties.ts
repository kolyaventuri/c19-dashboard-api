import AWS from 'aws-sdk';

import client from '../c19-client';

interface CountyData {
  range: string[];
  data: Array<Record<string, number>>;
}

export const update = async (): Promise<void> => {
  console.log('Connecting S3...');
  const S3 = new AWS.S3();
  const object = await S3.getObject({
    Bucket: 'c19-dashboard-api-production',
    Key: 'counties/risk-timeseries.json',
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

      countyData.data[countyData.data.length - 1][fips] = riskLevels.overall;
    }
  }

  console.log('Updated data, putting back in S3...');

  await S3.putObject({
    Bucket: 'c19-dashboard-api-production',
    Key: 'counties/risk-timeseries.json',
    Body: JSON.stringify(countyData),
  }).promise();

  console.log('DONE');
};
