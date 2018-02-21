const opn = require('opn');
const commandLineCommands = require('command-line-commands');
const commandLineUsage = require('command-line-usage');

const opnOptions = { wait: false };
const gatherSummary = require('../libs/gather-summary');
const values = require('lodash.values');
const keys = require('lodash.keys');

const HelperError = require('../libs/helper-error');

const GitApi = require('./git-api');

class ArgvExecutor {
    constructor(broCfg) {
        broCfg.commands.push(null);
        const { command, argv } = commandLineCommands(broCfg.commands);
        broCfg.commands.pop();
        this.command = command;
        this.argv = argv;
        this.broCfg = broCfg;
    }

    exec() {
        if (this.command) {
            this._execCommand();
        } else {
            this._execArgv();
        }
    }

    async _execCommand() {
        const { commandParams } = this.broCfg;
        let commandCfg = commandParams[this.command];
        if (!commandCfg) {
            throw new HelperError('There is no cfg for command.');
        }

        const getUrl = require(commandCfg.executor);
        const urls = await getUrl(commandCfg, GitApi);
        ArgvExecutor._open(urls);
    }

    static _open(url) {
        if (typeof url === 'string') {
            opn(url, opnOptions);
        } else if (Array.isArray(url)) {
            url.forEach(elem => {
                opn(elem, opnOptions);
            });
        } else {
            throw new HelperError('Cannot parse url for opening');
        }
    }

    _execArgv() {
        if (this.argv.includes('-h') || this.argv.includes('--help')) {
            this.printHelp();
        } else {
            throw new HelperError('There is no such args');
        }
    }

    printHelp() {
        const { commandParams } = this.broCfg;
        const rules = keys(this.broCfg.commandParams).map(gatherSummary(commandParams));

        const commandList = values(rules);
        commandList.unshift({ name: '--help', summary: 'Display help information about want.' });

        const sections = [
            {
                header: 'Broteam-Healper',
                content: 'Tool for quick opening services like Startrack, Qloud and etc. from local project directory.'
            },
            {
                header: 'Synopsis',
                content: '$ want <command> | --help'
            },
            {
                header: 'Command List',
                content: commandList
            }
        ];

        const usage = commandLineUsage(sections);
        console.log(usage);
    }
}

module.exports = ArgvExecutor;
