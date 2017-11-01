
# Backoff for Node.js

Fibonacci, exponential and fixed backoffs for Node.js.

## Installation

    $ npm install backoff.js

## Features

  * Fibonacci and exponential backoffs for Node.js.
  * Runs promise or callback functions

## Viewing Examples

```js

let backoff = new Backoff({
    strategy: 'fixed', // fixed/expo/fibo
    delay: 100,
    maxAttempts: 3
});
backoff.on('retry', (error, data) => {
    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
});
let options = {
    type: 'promise',  // promise/callback
    func: promiseFunction,
    args: { data: 'test' }
};
backoff.run(options).then(() => {
    console.log(`backoff started`);
}).catch((err) => {
    console.log(`backoff failed`);
});

```

## Running Tests

npm test

## License

This code is free to use under the terms of the [MIT license](http://mturcotte.mit-license.org/).
