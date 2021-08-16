/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import fs from 'fs';
import request from 'request';
import progress from 'request-progress';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

interface State {
  percent: number;
  speed: number;
  size: {
    total: number;
    transferred: number;
  };
  time: {
    elapsed: number;
    remaining: number;
  };
}

const url = `http://api.covidactnow.org/v2/counties.timeseries.json?apiKey=${process.env.COVID_ACT_NOW_KEY!}`;

const fetchCounties = async (path: string, useConsoleLog = false): Promise<void> => new Promise((resolve, reject) => {
  progress(request(url))
    .on('progress', (state: State) => {
      const percent = (state.percent * 100).toFixed(2);
      const value = `${state.size.transferred} / ${state.size.total} (${percent}%) - ${state.time.elapsed}s (${state.time.remaining} remaining)`;
      if (useConsoleLog) {
        console.log(value);
      } else {
        process.stdout.clearLine(-1);
        process.stdout.cursorTo(0);
        process.stdout.write(value);
      }
    })
    .on('error', (error: unknown) => {
      reject(error);
    })
    .on('end', () => {
      console.log('\nDONE.');
      resolve();
    })
    .pipe(fs.createWriteStream(path));
});

export default fetchCounties;
