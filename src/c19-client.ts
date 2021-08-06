import CovidActNow from '@kolyaventuri/covid-act-now';

const key = process.env.COVID_ACT_NOW_KEY!;
const client = new CovidActNow(key);

export default client;
