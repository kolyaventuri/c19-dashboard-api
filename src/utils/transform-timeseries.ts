type Timeseries = Array<Record<string, number>>;

type Data = Record<string, unknown>;

type TransformFunc = <T extends unknown[]>(data: T, dataKey: string, length?: number, extraKey?: string) => {
  range: string[];
  data: Timeseries;
};

interface Item {
  [key: string]: string | number;
  date: string;
}

const getEntryKey = (key: string, extraKey: string): string => {
  if (key === 'riskLevels') {
    return 'overall';
  }

  if (key === 'metrics') {
    return extraKey;
  }

  return '';
};

export const transformTimeseries: TransformFunc = (data, dataKey, length = 13, extraKey = '') => {
  const days: Record<string, Record<string, number>> = {};
  const entryKey = getEntryKey(dataKey, extraKey);

  for (const entry of (data as Data[])) {
    const abbr = entry.fips as string || 'UNKNOWN';
    const items = (entry[`${dataKey}Timeseries`] as Item[]).reverse().slice(0, length).reverse();

    for (const item of items) {
      if (!days[item.date]) {
        days[item.date] = {};
      }

      days[item.date][abbr] = item[entryKey] as number;
    }
  }

  const keys = Object.keys(days).sort();
  // Const items = {};
  // const dataList: Timeseries = keys.map(date => {
  //   const states = Object.keys(days[date]);

  //   for (const fips of states) {
  //     const value = days[date][fips];
  //     items.push({id: fips, value});
  //   }

  //   return items;
  // });

  const dataList: Timeseries = [];
  for (const date of keys) {
    const states = Object.keys(days[date]);
    const item: Timeseries[number] = {};

    for (const fips of states) {
      item[fips] = days[date][fips] ?? -1;
    }

    dataList.push(item);
  }

  return {
    range: keys,
    data: dataList,
  };
};
