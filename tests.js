/*
 * Created by nassi on 28/08/16.
 */

'use strict';

const { expect } = require("chai");
const Backoff = require('./lib/backoff');
const util = require('util');

function testCallbackSuccess(param, callback) {
    setTimeout(() => {
        return callback(null, true)
    }, 0)
}

function testCallbackError(param, callback) {
    setTimeout(() => {
        return callback(new Error('Callback Error'))
    }, 0)
}

function testPromiseSuccess(param) {
    return new Promise((resolve, reject) => {
        return resolve(true)
    });
}

function testPromiseError(param) {
    return new Promise((resolve, reject) => {
        return reject(new Error('Promise Error'))
    });
}

function testSyncSuccess(param) {
    return true;
}

function testSyncError(param) {
    throw new Error('Sync Error');
}

testCallbackSuccess = util.promisify(testCallbackSuccess);
testCallbackError = util.promisify(testCallbackError);

describe('Backoff', function () {
    describe('Actions', function () {
        describe('Validation', function () {
            it('should success to run backoff with no args', function (done) {
                this.timeout(20000);
                let backoff = new Backoff({
                    strategy: 'fixed',
                    delay: 0,
                    maxAttempts: 3
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.on('failed', (error) => {
                    console.log(`retry -> error: ${error.message}`);
                });
                backoff.run(testCallbackError).catch((err) => {
                    expect(err.message).to.equal('Callback Error');
                    done();
                });
            });
            it('should failed when options.func is not a function', function (done) {
                let backoff = new Backoff();
                backoff.run([32], ['test']).catch((err) => {
                    expect(err.message).to.equal('func must be from type function');
                    done();
                });
            });
        });
        describe('Retry', function () {
            it('should perform success retry three times', function (done) {
                let backoff = new Backoff({
                    strategy: 'fixed',
                    delay: 100,
                    maxAttempts: 3
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.retry((err, data) => {
                    backoff.retry((err, data) => {
                        backoff.retry((err, data) => {
                            expect(data).to.have.property('strategy');
                            expect(data).to.have.property('attempt');
                            expect(data).to.have.property('delay');

                            expect(data.strategy).to.equal('fixed');
                            expect(data.attempt).to.equal(3);
                            expect(data.delay).to.equal(100);
                            done();
                        });
                    });
                });
            });
            it('should failed to run more then three retries', function (done) {
                let backoff = new Backoff({
                    strategy: 'fixed',
                    delay: 100,
                    maxAttempts: 3
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.retry((err, data) => {
                    backoff.retry((err, data) => {
                        backoff.retry((err, data) => {
                            backoff.retry((err, data) => {
                                expect(err.message).to.equal('the current attempt is reached to max attempts [3]');
                                done();
                            });
                        });
                    });
                });
            });
        });
        describe('Callback', function () {
            it('should success to run backoff', function (done) {
                let backoff = new Backoff({
                    strategy: 'fixed',
                    delay: 100,
                    maxAttempts: 2
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}`);
                });
                backoff.run(testCallbackError, 'test').catch((err) => {
                    expect(err.message).to.equal('Callback Error');
                    done();
                });
            });
            it('should success to run backoff', function (done) {
                let backoff = new Backoff();
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}`);
                });
                backoff.run(testCallbackSuccess, 'test').then((response) => {
                    expect(response).to.be.true;
                    done();
                });
            });
        });
        describe('Promise', function () {
            it('should success to run backoff', function (done) {
                this.timeout(20000);
                let backoff = new Backoff({
                    strategy: 'fixed',
                    delay: 100,
                    maxAttempts: 2
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.run(testPromiseError, 'test').catch((err) => {
                    expect(err.message).to.equal('Promise Error');
                    done();
                });
            });
            it('should success to run backoff', function (done) {
                let backoff = new Backoff();
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.run(testPromiseSuccess, 'test').then((response) => {
                    expect(response).to.be.true;
                    done();
                });
            });
        });
        describe('Sync', function () {
            it('should success to run backoff', function (done) {
                let backoff = new Backoff({
                    strategy: 'fixed',
                    delay: 100,
                    maxAttempts: 2
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.run(testSyncError, 'test').catch((err) => {
                    expect(err.message).to.equal('Sync Error');
                    done();
                });
            });
            it('should success to run backoff', function (done) {
                let backoff = new Backoff();
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.run(testSyncSuccess, 'test').then((response) => {
                    expect(response).to.be.true;
                    done();
                });
            });
        });
    });
    describe('Strategy', function () {
        describe('fixed', function () {
            it('should success to run fixed backoff', function (done) {
                let backoff = new Backoff({
                    strategy: 'fixed',
                    delay: 100,
                    maxAttempts: 3
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.run(testCallbackError, 'test').catch((err) => {
                    expect(err.message).to.equal('Callback Error');
                    done();
                });
            });
        });
        describe('linear', function () {
            it('should success to run backoff', function (done) {
                let backoff = new Backoff({
                    strategy: 'linear',
                    delay: 100,
                    maxAttempts: 3
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.run(testCallbackError, 'test').catch((err) => {
                    expect(err.message).to.equal('Callback Error');
                    done();
                });
            });
        });
        describe('expo', function () {
            it('should success to run backoff', function (done) {
                let backoff = new Backoff({
                    strategy: 'expo',
                    delay: 100,
                    maxAttempts: 3
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.run(testCallbackError, 'test').catch((err) => {
                    expect(err.message).to.equal('Callback Error');
                    done();
                });
            });
        });
        describe('fibo', function () {
            it('should success to create job', function (done) {
                let backoff = new Backoff({
                    strategy: 'fibo',
                    delay: 100,
                    maxAttempts: 3
                });
                backoff.on('retry', (error, data) => {
                    console.log(`retry -> strategy: ${data.strategy}, attempt: ${data.attempt}, delay: ${data.delay}, error: ${error.message}`);
                });
                backoff.run(testCallbackError, 'test').catch((err) => {
                    expect(err.message).to.equal('Callback Error');
                    done();
                });
            });
        });
    });
});


