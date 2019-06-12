/*
 * Created by nassi on 08/03/17.
 */


const DEFAULT_STRATEGY = 'fixed';

const strategies = {
    fixed: (delay) => {
        return delay;
    },
    linear: (delay, attempt) => {
        return attempt * delay;
    },
    expo: (delay, attempt) => {
        return Math.round(Math.pow(1.5, attempt) * delay);
    },
    fibo: (delay, attempt) => {
        let prev = 1;
        let current = 0;
        let temp;
        while (attempt > 0) {
            temp = prev;
            prev += current;
            current = temp;
            attempt--;
        }
        return current * delay;
    }
};

const create = strategy => delay => (attempt) => {
    const strategyFunction = strategies[strategy] || strategies[DEFAULT_STRATEGY];
    return strategyFunction(delay, attempt);
};

module.exports.create = create;
