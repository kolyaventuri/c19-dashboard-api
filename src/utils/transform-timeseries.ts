type Timeseries<T> = Record<string, Record<string, T>>;

type Data = Record<string, unknown>;

type KeyType = 'state' | 'county';
type TransformFunc = <T extends unknown[], P = unknown>(data: T, key: KeyType, dataKey: string, length?: number) => {
  range: string[];
  data: Timeseries<P>;
};

interface Item {
  [key: string]: string | number;
  date: string;
}

const getEntryKey = (key: string): string => {
  if (key === 'riskLevels') {
    return 'overall';
  }

  return '';
};

export const transformTimeseries: TransformFunc = (data, key, dataKey, length = 13) => {
  const days: Record<string, Record<string, number>> = {};
  const entryKey = getEntryKey(dataKey);

  const _key = key === 'state' ? 'state' : 'fips';
  for (const entry of (data as Data[])) {
    const abbr = entry[_key] as string || 'UNKNOWN';
    const items = (entry[`${dataKey}Timeseries`] as Item[]).reverse().slice(0, length).reverse();

    for (const item of items) {
      if (!days[item.date]) {
        days[item.date] = {};
      }

      days[item.date][abbr] = item[entryKey] as number;
    }
  }

  const keys = Object.keys(days).sort();
  const stateList: Record<string, Record<string, any>> = {};
  for (const key of keys) {
    const states = Object.keys(days[key]);
    for (const abbr of states) {
      const value = days[key][abbr];

      if (!stateList[abbr]) {
        stateList[abbr] = {};
      }

      stateList[abbr][key] = value;
    }
  }

  return {
    range: keys,
    data: stateList,
  };
};
