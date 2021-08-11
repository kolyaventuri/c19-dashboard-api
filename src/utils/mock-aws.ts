import fs from 'fs';
import path from 'path';

interface Props {
  Bucket: string;
  Key: string;
}

type GetObject = {
  promise: () => Promise<{Body?: string}>;
};

class S3 {
  getObject({Key}: Props): GetObject {
    let file: string;
    if (Key === 'counties/risk-timeseries.json') {
      file = '../../../../../seed/counties.parsed.json';
    }

    return {
      promise: async (): Promise<any> => new Promise((resolve, reject) => {
        // eslint-disable-next-line unicorn/prefer-module
        fs.readFile(path.join(__dirname, file), {encoding: 'utf-8'}, (error, data) => {
          if (error) {
            reject(error);
            return;
          }

          resolve({
            Body: {
              toString: () => data,
            },
          });
        });
      }),
    };
  }
}

const AWS: {
  S3: typeof S3;
} = {
  S3,
};

export default AWS;
