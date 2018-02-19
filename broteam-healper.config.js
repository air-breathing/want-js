module.exports = {
    commandParams: {
        gt: {
            executor: `${__dirname}/commands/github.js`,
            type: 'file',
            file: '',
            expression: '',
            summary: 'Open github.',
            aliases: ['github']
        }
    },
    default: ''
};
