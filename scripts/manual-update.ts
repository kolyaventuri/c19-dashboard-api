import {update} from '../src/utils/update-counties';

(async () => {
  try {
    await update();
    process.exit(0);
  } catch (error: unknown) {
    throw error;
  }
})();
