import path from 'path';
import fetchCounties from '../src/utils/fetch-counties';

const file = path.join(__dirname, '../seed/counties.timeseries.json');

(async () => {
  try {
    await fetchCounties(file);
  } catch (error: unknown) {
    throw error;
  }

  process.exit(0);
})();
