// Developer environment
require('dotenv').config();

// main parameters for Lambda.
const event = {};

const context = {};

// const lambda = require('./build/index');
const lambda = require('./src/index');

// Execute.
console.time('execute lambda.handler');
lambda.handler(event, context)
  .then(data => console.log(`Process complete successfully. Returned value is below.\r\n${data}`))
  .catch(e => console.error(e))
  .then(() => console.timeEnd('execute lambda.handler'));
