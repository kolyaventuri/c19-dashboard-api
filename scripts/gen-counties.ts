import path from 'path';
import fs from 'fs';
import StreamArray from 'stream-json/streamers/StreamArray';

const enablePOC = false;
const file = path.join(__dirname, '../seed/counties.timeseries.json');

const pipeline = fs.createReadStream(file).pipe(StreamArray.withParser());

const res: {[key: string]: any} = {
  range: {},
  data: {}
};
let count = 0;
let start = process.hrtime();
let floatingStart = process.hrtime();
const range = new Set<string>([]);
pipeline.on('data', (data: any) => {
  const {value} = data;
  const {fips, state, riskLevelsTimeseries} = value;
  const item: {[key: string]: any} = {
    state,
    risks: {}
  };
  const timeseries = riskLevelsTimeseries.reverse().slice(0, 30).reverse();
  for (const risk of timeseries) {
    if (!range.has(risk.date)) {
      range.add(risk.date);
    }

    item.risks[risk.date] = risk.overall;
  }

  res.data[fips] = item;
  res.range = Array.from(range).sort();

  if (count === 10 && enablePOC) {
    res.range = Array.from(range);
    const data = {...(res.data)};
    res.data = [];
    const dates: any = {};
    for (const fips of Object.keys(data)) {
      const cData = data[fips].risks;
      const ds = Object.keys(cData);
      for (const date of ds) {
        if (!dates[date]) {
          dates[date] = {};
        }

        dates[date][fips] = cData[date];
      }
    }
    res.data = Object.values(dates);
    fs.writeFile(path.join(__dirname, '../seed/poc.json'), JSON.stringify(res, null, 2), (error) => {
      if (error) throw error;
      console.log('WROTE POC');
      process.exit(0);
    });
  }
  count++;

  if (count % 100 === 0) {
    const end = process.hrtime(start);
    const floatingEnd = process.hrtime(floatingStart);
    const time = (floatingEnd[1] / 1000000).toFixed(2);

    process.stdout.clearLine(-1);
    process.stdout.cursorTo(0);
    process.stdout.write(`Last batch of 100 completed in ${floatingEnd[0]}s ${time}ms (total: ${count} in ${end[0]}s)...`);
    floatingStart = process.hrtime(); 
  }
});

pipeline.on('end', () => {
  const data = {...(res.data)};
  res.data = [];
  const dates: any = {};
  for (const fips of Object.keys(data)) {
    const cData = data[fips].risks;
    const ds = Object.keys(cData);
    for (const date of ds) {
      if (!dates[date]) {
        dates[date] = {};
      }

      dates[date][fips] = cData[date];
    }
  }
  res.data = Object.values(dates);
  fs.writeFileSync(path.join(__dirname, '../seed/counties.parsed.json'), JSON.stringify(res), {encoding: 'utf-8'});
  const end = process.hrtime(start);
  console.log(`\n\n\nDONE. Processed ${count} objects in ${end[0]}s`)
  process.exit(0);
});

pipeline.on('error', (error: unknown) => {
  throw error;
});
 