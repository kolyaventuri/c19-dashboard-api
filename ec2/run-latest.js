const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const {promisify} = require('util');

const S3 = new AWS.S3();

const file = path.join(__dirname, 'ec2-values.json');
let db = {};
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

if (!fs.existsSync(file)) {
  fs.writeFileSync(file, '{}', {encoding: 'utf-8'});
}

db = require(file);

const ONE_DAY = 1000 * 60 * 60 * 24;

const fetchOrStore = async (key, fn) => {
  const useCache = db[key] && (db[key].value && db[key].cacheUntil > Date.now());
  if (useCache) {
    return db[key].value; 
  }

  const oldVal = db[key] ? db[key].value : '';

  const result = await fn(oldVal);
  db[key] = {
    value: result,
    cacheUntil: Date.now() + ONE_DAY
  };

  await writeFile(file, JSON.stringify(db), {encoding: 'utf-8'});

  return result;
};

(async () => {
  const Bucket = await fetchOrStore('Bucket', async () => {
    const result = await S3.listBuckets().promise();
    const value = result.Buckets?.find(({Name = ''}) => Name.startsWith('c19-dashboard') && Name.indexOf('serverless') > -1).Name;
    if (!value) {
      throw new Error('Bucket not found');
    }

    return value;
  });

  console.log('Using bucket', Bucket);

  const {Key, old} = await fetchOrStore('zip', async (old) => {
    const objResult = await S3.listObjects({
      Bucket,
      Prefix: 'serverless/c19-dashboard-api/production'
    }).promise();

    const updaters = objResult.Contents?.filter(({Key}) => Key.endsWith('fullUpdater.zip')) ?? [];
    if (updaters.length === 0) {
      throw new Error('Cannot find updater code');
    }

    const latest = updaters.sort((a, b) => {
      if (a.LastModified > b.LastModified) {
        return -1;
      }

      if (a.LastModified < b.LastModified) {
        return 1;
      }

      return 0;
    })[0];

    if (!latest?.Key) {
      throw new Error('Something went wrong finding the latest version...');
    }

    const {Key} = latest;
    return {Key, old};
  });

  console.log('Found zip:', Key);
  
  const zipName = `updater.zip`;

  const freshPath = path.join(__dirname, zipName);

  const exDir = path.join(__dirname, 'extracted');
  const postZip = async (code) => {
    if (code !== 0) {
      throw new Error(`unzip exited with ${code}`);
    }

    console.log('Unzipped.');
    console.log('Removing zip');
    try {
      await unlink(freshPath);
    } catch (error) {
      console.error(error);
      console.log('Failed to remove zip, ignoring...');
    }

    const EFS_PATH = path.join(__dirname, './seed');
    const doesExist = await exists(EFS_PATH);
    if (doesExist) {
      console.log('Removing old seeds...');
      await rmdir(EFS_PATH, {recursive: true});
    }
    await mkdir(EFS_PATH);
    process.env.EFS_PATH = EFS_PATH;

    console.log('Running latest updater...');

    const {update} = require(path.join(exDir, 'src/utils/fetch-and-update'));
    await update();
  };

  if (Key !== old) {
    const object = await S3.getObject({
      Bucket,
      Key
    }).promise();

    await writeFile(freshPath, object.Body);
    console.log('Wrote', zipName);

    const exExists = await exists(exDir);
    if (exExists) {
      console.log('Removing old directory...');
      await rmdir(exDir, {recursive: true});
    }

    console.log('Unzipping');
    const proc = spawn('unzip', ['-o', '-d', exDir, freshPath])

    proc.stdout.on('data', (data) => {
      //console.log(data);
    });

    proc.on('exit', postZip)
  } else {
    await postZip(0);
  }
})();
