import yargs from 'yargs/yargs';

const argv = yargs(process.argv.slice(2)).option(
  'type',
  {
    choices: ['county', 'state'] as const,
    default: 'county'
  }
).parseSync();

const pluralize = (s: string) => {
  if (s === 'county') {
    return 'counties';
  }

  if (s === 'state') {
    return 'states';
  }

  return s;
}

const name = pluralize(argv.type);
console.log(`Fetching ${name}...`);
const file = `./fetch-${name}.ts`;

require(file);
