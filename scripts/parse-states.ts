import fs from 'fs';
import path from 'path';

console.log('Loading data...');
const data = require('../seed/states.timeseries.json');
const num = (data as any).length;

const risks: any = {};

console.log('Parsing...');
for (const state of data as any) {
  for (const risk of state.riskLevelsTimeseries) {
    risks[risk.date] = risks[risk.date] || [];
    risks[risk.date].push(risk.overall);
  }
  console.log(`Parsed fips ${state.fips}`);
}

const newRisk: any = {};

console.log('Filtering...');
for (const [date, values] of Object.entries(risks)) {
  if ((values as any).length >= num - 2) {
    newRisk[date] = values;
  }
}

console.log('Averaging....');

const averages = [];
for (const [date, values] of Object.entries(newRisk)) {
  const vals = values as any;

  const avg = vals.reduce((a, b) => a + b) / vals.length;
  averages.push([date, avg]);
}

console.log('Finding max...');
let max = [averages[0]];
for (const part of averages) {
  if (part[1] === max[0][1]) {
    max.push(part);
  } else if (part[1] > max[0][1]) {
    max = [part];
  }
}

console.log('\n\n');
console.log(max);


const output: string[] = ['date,average risk'];
console.log('Generating csv...');
for (const part of averages) {
  output.push(part.join(','));
}

console.log('Writing file...');
const outfile = path.join(__dirname, '../seed/risk-list.csv');

fs.writeFileSync(outfile, output.join('\n'), {encoding: 'utf-8'});
console.log('DONE')

