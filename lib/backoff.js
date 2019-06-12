/*
 * Created by nassi on 02/03/17.
 */


const EventEmitter = require('events');
const strategy = require('./strategy');

class Backoff extends EventEmitter {
    constructor(options) {
        super();
        this._backoff = this._defaultBackoff(options);
        this._strategy = strategy.create(this._backoff.strategy);
        this._delayFunc = this._strategy.call(null, this._backoff.delay);
    }

    run(func, ...args) {
        return new Promise((resolve, reject) => {
            if (!this._isFunction(func)) {
                throw new TypeError('func must be from type function');
            }
            const attempt = 0;
            return this._run(func, args, attempt, resolve, reject);
        });
    }

    async _run(func, args, attempt, resolve, reject) {
        try {
            const response = await func(args);
            this._reset();
            return resolve(response);
        }
        catch (error) {
            this._retry(++attempt, (err, params) => {
                if (err) {
                    this.emit('failed', err, params);
                    return reject(error);
                }
                this.emit('retry', error, params);
                this._run(func, args, attempt, resolve, reject);
            });
        }
    }

    retry(callback) {
        this._currentAttempt = this._currentAttempt || 0;
        this._retry(++this._currentAttempt, callback);
    }

    _retry(currentAttempt, callback) {
        if (currentAttempt <= this._backoff.maxAttempts) {
            const delay = this._delayFunc.call(null, currentAttempt);
            const params = { strategy: this._backoff.strategy, attempt: currentAttempt, delay };
            setTimeout(() => {
                return callback(null, params);
            }, delay);
        }
        else {
            this._reset();
            return callback(new Error(`the current attempt is reached to max attempts [${this._backoff.maxAttempts}]`));
        }
    }

    _reset() {
        this._currentAttempt = 0;
    }

    _defaultBackoff(backoff) {
        const defaultBackoff = {
            strategy: 'expo',
            delay: 1000,
            maxAttempts: 3
        };
        return Object.assign({}, defaultBackoff, backoff);
    }

    _isFunction(func) {
        return typeof func === 'function';
    }
}

module.exports = Backoff;
