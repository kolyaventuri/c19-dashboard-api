import fs from 'fs';
import path from 'path';

interface Props {
  Bucket: string;
  Key: string;
}

interface PutProps extends Props {
  Body: string;
}

type GetObject = {
  promise: () => Promise<{Body?: string}>;
};

type PutObject = {
  promise: () => Promise<void>;
};

class S3 {
  getObject({Key}: Props): GetObject {
    let file: string;
    if (Key === 'counties/timeseries.json') {
      file = '../../../../seed/timeseries.json';
    }

    return {
      promise: async (): Promise<any> => new Promise((resolve, reject) => {
        // eslint-disable-next-line unicorn/prefer-module
        const fPath = path.join(__dirname, file);
        fs.readFile(fPath, {encoding: 'utf-8'}, (error, data) => {
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

  putObject({Key, Body}: PutProps): PutObject {
    let file: string;

    if (Key === 'counties/timeseries.json') {
      file = '../../../../seed/timeseries.json';
    }

    return {
      promise: async (): Promise<void> => new Promise((resolve, reject) => {
        // eslint-disable-next-line unicorn/prefer-module
        const fPath = path.join(__dirname, file); 
        fs.writeFile(fPath, Body, {encoding: 'utf-8'}, error => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      })
    };
  }
}

const AWS: {
  S3: typeof S3;
} = {
  S3,
};

export default AWS;
