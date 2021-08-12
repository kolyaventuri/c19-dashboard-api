type Timeseries = {id: string; value: number;}[];

type Data = Record<string, unknown>;

type TransformFunc = <T extends unknown[]>(data: T, dataKey: string, length?: number) => {
  range: string[];
  data: Timeseries[];
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

export const transformTimeseries: TransformFunc = (data, dataKey, length = 13) => {
  const days: Record<string, Record<string, number>> = {};
  const entryKey = getEntryKey(dataKey);

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
  const dataList: Timeseries[] = keys.map(date => {
    const states = Object.keys(days[date]);

    const items = [];
    for (const fips of states) {
      const value = days[date][fips];
      items.push({id: fips, value});
    }

    return items;
  });

  return {
    range: keys,
    data: dataList,
  };
};
