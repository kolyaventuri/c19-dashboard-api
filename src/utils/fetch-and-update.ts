import path from 'path';
import fs from 'fs';
import {promisify} from 'util';

import AWS from './aws-or-mock';
import fetchCounties from './fetch-counties';
import genCounties from './gen-counties';

const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);

export const update = async (): Promise<void> => {
  process.env.USE_SHORT_PATH = 'true';
  const efsPath: string = process.env.NODE_ENV === 'production' ? process.env.EFS_PATH! : path.join(__dirname, '../../seed');
  const timestamp = Date.now();
  const dataPath = path.join(efsPath, `/counties.timeseries-${timestamp}.json`);
  const outPath = path.join(efsPath, `/timeseries-${timestamp}.json`);

  try {
    await fetchCounties(dataPath, true);
    await genCounties(dataPath, outPath, true);

    const data = await readFile(outPath);
    const S3 = new AWS.S3();
    await S3.putObject({
      Bucket: 'c19-dashboard-api-production',
      Key: 'counties/timeseries.json',
      Body: data,
    }).promise();
  } catch (error: unknown) {
    console.error(new Error('Fail').stack);
    console.trace();
    console.error((error as Error).stack);
    throw error;
  } finally {
    await unlink(dataPath); // Cleanup full dataset
    await unlink(outPath); // Cleanup parsed data
  }
};
