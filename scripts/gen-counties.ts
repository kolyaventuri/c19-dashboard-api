import path from 'path';
import genCounties from '../src/utils/gen-counties';

const file = path.join(__dirname, '../seed/counties.timeseries.json');
const outFile = path.join(__dirname, '../seed/timeseries.json');

(async () => {
  try {
    await genCounties(file, outFile, false, false);
  } catch (error: unknown) {
    throw error;
  }
})();

