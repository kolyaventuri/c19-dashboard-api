import path from 'path';
import fetchCounties from '../src/utils/fetch-states';

const file = path.join(__dirname, '../seed/states.timeseries.json');

(async () => {
  try {
    await fetchCounties(file);
  } catch (error: unknown) {
    throw error;
  }

  process.exit(0);
})();
