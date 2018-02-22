#!/usr/bin/env node

const keys = require('lodash.keys');
const ArgvExecutor = require('./argv-executor');
const Lookuper = require('config-lookuper');
const configName = '.want-js.config.js';

function init() {
    const lookuper = new Lookuper(configName);
    let executor;

    const broCfg = lookuper
        .lookup(process.cwd())
        .lookupNPM(process.cwd(), 'want-js-plugin.')
        .resultConfig;

    broCfg.commands = keys(broCfg.commandParams);

    try {
        executor = new ArgvExecutor(broCfg);
        executor.exec();
    } catch (e) {
        if (e.type === 'HelperError') {
            console.error('\x1b[31m', e.message);
        } else {
            console.error('\x1b[31m', e);
        }
        if (executor && executor.printHelp) {
            executor.printHelp();
        }
    }
}

init();
