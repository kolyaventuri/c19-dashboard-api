import request from 'request';
import progress from 'request-progress';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

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
  }
}

const  url = `http://api.covidactnow.org/v2/counties.timeseries.json?apiKey=${process.env.COVID_ACT_NOW_KEY as string}`;
const file = path.join(__dirname, '../seed/counties.timeseries.json');
progress(request(url))
  .on('progress', (state: State) => {
    const percent = (state.percent * 100).toFixed(2);
    const value = `${state.size.transferred} / ${state.size.total} (${percent}%) - ${state.time.elapsed}s (${state.time.remaining} remaining)`;
    process.stdout.clearLine(-1);
    process.stdout.cursorTo(0);
    process.stdout.write(value);
  })
  .on('error', (error: unknown) => {
    throw error;
  })
  .on('end', () => {
    console.log('\n\nDONE');
  })
  .pipe(fs.createWriteStream(file));
