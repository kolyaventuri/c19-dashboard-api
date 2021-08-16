import {update} from '../src/utils/fetch-and-update';

(async () => {
  await update(); 
  process.exit(0);
})();
