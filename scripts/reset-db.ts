import {_db} from '../src/db';

const tableNames = ['c19-dashboard-cache_local'];
const db = _db({
  endpoint: 'http://localhost:8000',
  region: 'local',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
});

const ops: Promise<any>[] = [];
for (const TableName of tableNames) {
  const op = db.deleteTable({TableName}).promise();
  ops.push(op);
}

Promise.all(ops)
  .then(() => {
    console.log('Dropped tables ' + tableNames.join(', '));
    process.exit(0);
  })
  .catch(error => {
    throw new Error(error);
    process.exit(1);
  });
