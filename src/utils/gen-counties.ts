import fs from 'fs';
import StreamArray from 'stream-json/streamers/StreamArray';
import {CountyTimeseries} from '@kolyaventuri/covid-act-now/types';

type County = {
  risk: number;
  r0: number;
  positivity: number;
  density: number;
};

type Day = Record<string, County>;

interface Result {
  range: string[];
  data: Day[];
}

type Entry = Record<string, number>;
interface ParseItem {
  [key: string]: Entry;
  risk: Entry;
  r0: Entry;
  positivity: Entry;
  density: Entry;
}

interface ParseResult {
  range: string[];
  data: Record<string, ParseItem>;
}
const totalItems = 3222;

const transformResult = (result: ParseResult) => {
  const data = {...(result.data)};
  const newResult: Result = {
    range: [],
    data: [],
  };

  const dates: Record<string, Day> = {};

  for (const fips of Object.keys(data)) {
    const cData = data[fips];
    const keys = Object.keys(cData) as Array<keyof County>;

    const ds = Object.keys(cData.risk);
    for (const date of ds) {
      if (!dates[date]) {
        dates[date] = {};
      }

      // {[date]: {[fips]: data}}
      const county: Partial<County> = {};
      for (const key of keys) {
        county[key] = cData[key][date];
      }

      dates[date][fips] = county as County;
    }
  }

  const entries: Array<[string, Day]> = Object.entries(dates).sort(([a], [b]) => {
    if (a > b) {
      return 1;
    }

    if (a < b) {
      return -1;
    }

    return 0;
  });

  /* eslint-disable max-depth */
  for (const [_i, [date, data]] of Object.entries(entries)) {
    const i = Number.parseInt(_i, 10);

    newResult.range.push(date);

    if (i > 0) {
      // Iterate over every fips key on the previous day
      const previousData = newResult.data[i - 1];
      for (const fipsKey of Object.keys(previousData)) {
        if (data[fipsKey]) {
          // Exists, check each key
          const county = data[fipsKey];
          for (const [type, value] of Object.entries(county)) {
            if (value < 0) {
              // @ts-expect-error - Funky
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              data[fipsKey][type] = previousData[fipsKey][type];
            }
          }
        } else {
          // Clone if not exists
          data[fipsKey] = previousData[fipsKey];
        }
      }
    }

    newResult.data.push(data);
  }
  /* eslint-enable max-depth */

  return newResult;
};

const genCounties = async (path: string, outPath: string, useConsoleLog = false, enablePOC = false): Promise<void> => new Promise((resolve, reject) => {
  console.log(useConsoleLog);
  const pipeline = fs.createReadStream(path).pipe(StreamArray.withParser());

  const result: ParseResult = {
    range: [],
    data: {},
  };
  let count = 0;
  let floatingStart = process.hrtime();
  const start = process.hrtime();
  const range = new Set<string>([]);
  const chunkTime: number[] = [];

  pipeline.on('data', (data: {value: CountyTimeseries}) => {
    const {value} = data;
    const {fips, riskLevelsTimeseries, metricsTimeseries} = value;
    const item: ParseItem = {
      risk: {},
      r0: {},
      positivity: {},
      density: {},
    };

    /* HANDLE RISK DATA */
    const riskTimeseries = riskLevelsTimeseries.reverse().slice(0, 30).reverse();
    for (const risk of riskTimeseries) {
      if (!range.has(risk.date)) {
        range.add(risk.date);
      }

      item.risk[risk.date] = risk.overall;
    }
    /* END HANDLE RISK DATA */

    /* HANDLE METRICS DATA */
    const metricTimeseries = metricsTimeseries.reverse().slice(0, 30).reverse();
    for (const metric of metricTimeseries) {
      if (!range.has(metric.date)) {
        range.add(metric.date);
      }

      item.r0[metric.date] = metric.infectionRate ?? -1;
      item.positivity[metric.date] = metric.testPositivityRatio ?? -1;
      item.density[metric.date] = metric.caseDensity ?? -1;
    }
    /* HANDLE METRICS DATA */

    result.data[fips] = item;
    result.range = Array.from(range).sort();

    if (count === 10 && enablePOC) {
      const newResult = transformResult(result);

      fs.writeFile(outPath, JSON.stringify(newResult, null, 2), (error: unknown) => {
        if (error) {
          throw error;
        }

        console.log('WROTE POC');
        resolve();
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(0);
      });
      return;
    }

    count++;
    if (count % 100 === 0) {
      const end = process.hrtime(start);
      const floatingEnd = process.hrtime(floatingStart);
      const ms = floatingEnd[1] / 1e6;
      const secs = floatingEnd[0];

      const timeInMs = (secs * 1000) + ms;
      chunkTime.push(timeInMs);
      // eslint-disable-next-line unicorn/no-array-reduce
      const avg = chunkTime.reduce((s, v) => s + v, 0) / chunkTime.length;
      const avgS = Math.trunc(avg / 1000);
      const avgMs = avg - (avgS * 1000);

      const est = (((totalItems - count) / 100) * avgS).toPrecision(4);

      const value = `Last batch of 100 completed in ${secs}s ${ms.toFixed(2)}ms (total: ${count} in ${end[0]}s) (avg: ${avgS}s ${avgMs.toFixed(2)}ms, est remaining: ${est}s)...`;
      if (useConsoleLog) {
        console.log(value);
      } else {
        process.stdout.clearLine(-1);
        process.stdout.cursorTo(0);
        process.stdout.write(value);
      }

      floatingStart = process.hrtime();
    }
  });

  pipeline.on('end', () => {
    const newResult = transformResult(result);

    fs.writeFile(outPath, JSON.stringify(newResult), (error: unknown) => {
      if (error) {
        throw error;
      }

      const end = process.hrtime(start);
      console.log(`\n\n\nDONE. Processed ${count} objects in ${end[0]}s`);
      resolve();
    });
  });

  pipeline.on('error', (error: unknown) => {
    reject(error);
  });
});

export default genCounties;
