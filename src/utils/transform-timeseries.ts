interface Timeseries<T> {
  [date: string]: T[] 
}

interface Data {
  [key: string]: unknown;
}

type KeyType = 'state' | 'county';
interface TransformFunc {
  <T extends Array<unknown>, P = unknown>(data: T, key: KeyType, dataKey: string): Timeseries<P>;
}

interface Item {
  date: string;
  [key: string]: any;
}

const getEntryKey = (key: string): string => {
  if (key === 'riskLevels') return 'overall';
  return '';
};

export const transformTimeseries: TransformFunc = (data, key, dataKey) => {
  const days: {[key: string]: {[key: string]: number}} = {};
  const entryKey = getEntryKey(dataKey);

  const _key = key === 'state' ? 'state' : 'fips';
  for (const e of data) {
    const entry = e as Data;
    const abbr = entry[_key] as string || 'UNKNOWN';
    const items = (entry[`${dataKey}Timeseries`] as Item[]).reverse().slice(0, 13).reverse();        

    for (const item of items) {
      if (!days[item.date]) {
        days[item.date] = {};
      }
      days[item.date][abbr] = item[entryKey];
    }
  }

  const keys = Object.keys(days);
  const stateList: {[key: string]: any[]} = {};
  for (const key of keys) {
    const states = Object.keys(days[key]);
    for (const abbr of states) {
      const value = days[key][abbr];

      if (!stateList[abbr]) stateList[abbr] = [];
      stateList[abbr].push(value);
    }
  }

  return stateList;
};
