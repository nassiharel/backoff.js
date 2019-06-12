
# Backoff for Node.js

Fibonacci, exponential, fixed and linear backoffs for Node.js.

## Installation

    $ npm install backoff.js

## Features

  * Fibonacci and exponential backoffs for Node.js.
  * Runs promise/callback/sync functions

## Viewing Examples

```js
const backoff = require('backoff.js');

const backoff = new Backoff({
    strategy: 'fixed', // fixed/expo/fibo/linear
    delay: 100,        // in ms
    maxAttempts: 3
});
backoff.on('retry', (error, data) => {
    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
});
backoff.on('failed', (error) => {
    console.log(`retry -> error: ${error.message}`);
});

// if your function is callback style, convert it to promise.
// e.g. util.promisify(func)

backoff.run(promiseFunction, { data: 'test' }).then(() => {
    console.log(`success`);
}).catch((err) => {
    console.log(`failed`);
});

```

## Running Tests

npm test

## License

This code is free to use under the terms of the [MIT license](http://mturcotte.mit-license.org/).
