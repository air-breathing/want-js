#!/usr/bin/env node

const keys = require('lodash.keys');
const ArgvExecutor = require('./argv-executor');
const Lookuper = require('config-lookuper');
const configName = '.want-js.config.js';

async function init() {
    const lookuper = new Lookuper(configName);
    let executor;

    const broCfg = (await lookuper
        .lookup(process.cwd())
        .lookupNPM(process.cwd(), 'want-js-plugin.')
        .lookupGlobalModules('want-js-plugin.'))
        .resultConfig;

    broCfg.commands = keys(broCfg.commandParams);
    broCfg.aliases = {};

    const aliases = broCfg.commands.map(command => {
        const currentAliases = broCfg.commandParams[command].aliases;
        currentAliases.forEach(alias => {
            broCfg.aliases = { [alias]: command };
        });
        return currentAliases;
    });

    broCfg.commands = Array.prototype.concat.apply(broCfg.commands, aliases);

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
