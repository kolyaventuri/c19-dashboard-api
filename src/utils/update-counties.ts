import AWS from 'aws-sdk';

import client from '../c19-client';

interface CountyData {
  range: string[];
  data: Record<string, {
    state: string;
    risks: Record<string, number>;
  }>;
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

  for (const county of counties) {
    const {
      fips,
      riskLevels,
      lastUpdatedDate: date,
    } = county;
    if (!countyData.range.includes(date)) {
      countyData.range.push(date);
    }

    if (countyData.data[fips]?.risks) {
      countyData.data[fips].risks[date] = riskLevels.overall;
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
