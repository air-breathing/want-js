import test from 'ava';
import gatherSummary from '../libs/gather-summary';

test.beforeEach(t => {
    const commandsExecFilename = {
        s: {
            type: 'command',
            summary: 'test startrek',
            aliases: ['st', 'star', 'startrek']
        },
        bunker: {
            type: 'command',
            summary: 'test bunker'
        }
    };

    t.context.gatherSummary = gatherSummary(commandsExecFilename);
});

test('Check that it works with usual config.', t => {
    const expected = {
        name: 's, st, star, startrek',
        summary: 'test startrek'
    };

    const actual = t.context.gatherSummary('s');

    t.deepEqual(actual, expected);
});

test('Check that it works with usual config without aliases.', t => {
    const expected = {
        name: 'bunker',
        summary: 'test bunker'
    };

    const actual = t.context.gatherSummary('bunker');
    t.deepEqual(actual, expected);
});
