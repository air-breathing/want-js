import test from 'ava';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

let COMMON_GITHUB_OAUTH_TOKEN;
const TOKEN = 'token';
const TEST_TOKEN = 'test_token';

test.before(() => {
    COMMON_GITHUB_OAUTH_TOKEN = process.env.COMMON_GITHUB_OAUTH_TOKEN;
    process.env.COMMON_GITHUB_OAUTH_TOKEN = TOKEN;
    process.env.TEST_TOKEN = TEST_TOKEN;
});

test('Check correctness of options for github.com api', async t => {
    class FakeGitHub {
        constructor(options) {
            t.deepEqual(options, {}, 'Expected empty object');
        }

        authenticate(authOptions) {
            const expected = {
                type: 'token',
                token: TOKEN
            };
            t.deepEqual(authOptions, expected, 'Expected object with token');
        }
    }

    const GitApi = proxyquire('../src/git-api', {
        '@octokit/rest': FakeGitHub
    });

    const gitApi = new GitApi('github.com');
    await gitApi._connectGithub();
});

test('Check correctness of options for other api with prefix', async t => {
    const host = 'github.some.com';
    const pathPrefix = '/v3/api';
    const testToken = 'TEST_TOKEN';
    class FakeGitHub {
        constructor(options) {
            const expected = {
                host,
                pathPrefix
            };
            t.deepEqual(options, expected, 'Expected empty object');
        }

        authenticate(authOptions) {
            const expected = {
                type: 'token',
                token: TEST_TOKEN
            };
            t.deepEqual(authOptions, expected, 'Expected object with token');
        }
    }

    const GitApi = proxyquire('../src/git-api', {
        '@octokit/rest': FakeGitHub
    });

    const gitApi = new GitApi(host, pathPrefix, testToken);
    await gitApi._connectGithub();
});

test('Check static method getBranchName', async t => {
    const revParseStub = sinon.stub().resolves(' some_branch_name\n');
    const GitApi = proxyquire('../src/git-api', {
        'simple-git/promise': () => {
            return {
                revparse: revParseStub
            };
        }
    });
    const actual = await GitApi.getBranchName();
    t.is(revParseStub.callCount, 1, 'Execute git.revparse must be once called');
    t.deepEqual(revParseStub.getCall(0).args[0], ['--abbrev-ref', 'HEAD'], 'Execute git.revparse must be called with one arguments: --abbrev-ref HEAD');
    t.is(actual, 'some_branch_name', 'Branch name must be without whitespace symbols');
});

test('Check static method getBranchName', async t => {
    const revParseStub = sinon.stub().resolves('1234567890\n');
    const GitApi = proxyquire('../src/git-api', {
        'simple-git/promise': () => {
            return {
                revparse: revParseStub
            };
        }
    });
    const actual = await GitApi.getCommit();
    t.is(revParseStub.callCount, 1, 'Execute git.revparse must be once called');
    t.deepEqual(revParseStub.getCall(0).args[0], ['HEAD'], 'Execute git.revparse must be called with one arguments: HEAD');
    t.is(actual, '1234567890', 'Branch name must be without whitespace symbols');
});

test('Check static method getParsedRemoteOriginUrl with git@github.com', async t => {
    let GitApi = proxyquire('../src/git-api', {
        'git-remote-origin-url': () => {
            return 'git@github.com:test-org/want-js-plugin.test.git';
        }
    });
    const actual = await GitApi.getParsedRemoteOriginUrl();
    const expected = {
        protocol: 'git',
        username: '',
        url: 'github.com',
        organization: 'test-org',
        repository: 'want-js-plugin.test'
    };
    t.deepEqual(actual, expected);
});

test('Check static method getParsedRemoteOriginUrl with https://github.com', async t => {
    let GitApi = proxyquire('../src/git-api', {
        'git-remote-origin-url': () => {
            return 'https://github.com/test-org/want-js-plugin.test.git';
        }
    });
    const actual = await GitApi.getParsedRemoteOriginUrl();
    const expected = {
        protocol: 'https',
        username: '',
        url: 'github.com',
        organization: 'test-org',
        repository: 'want-js-plugin.test'
    };
    t.deepEqual(actual, expected);
});

test('Check static method getParsedRemoteOriginUrl with https://username@bitbucket.org', async t => {
    let GitApi = proxyquire('../src/git-api', {
        'git-remote-origin-url': () => {
            return 'https://username@bitbucket.org/test-org/want-js-plugin.test.git';
        }
    });
    const actual = await GitApi.getParsedRemoteOriginUrl();
    const expected = {
        protocol: 'https',
        username: 'username',
        url: 'bitbucket.org',
        organization: 'test-org',
        repository: 'want-js-plugin.test'
    };
    t.deepEqual(actual, expected);
});

test('Check static method getParsedRemoteOriginUrl with git@bitbucket.org', async t => {
    let GitApi = proxyquire('../src/git-api', {
        'git-remote-origin-url': () => {
            return 'git@bitbucket.org:test-org/want-js-plugin.test.git';
        }
    });
    const actual = await GitApi.getParsedRemoteOriginUrl();
    const expected = {
        protocol: 'git',
        username: '',
        url: 'bitbucket.org',
        organization: 'test-org',
        repository: 'want-js-plugin.test'
    };
    t.deepEqual(actual, expected);
});

test('Check static method getParsedRemoteOriginUrl with git@github.any-site.org', async t => {
    let GitApi = proxyquire('../src/git-api', {
        'git-remote-origin-url': () => {
            return 'git@github.any-site.org:test-org/want-js-plugin.test.git';
        }
    });
    const actual = await GitApi.getParsedRemoteOriginUrl();
    const expected = {
        protocol: 'git',
        username: '',
        url: 'github.any-site.org',
        organization: 'test-org',
        repository: 'want-js-plugin.test'
    };
    t.deepEqual(actual, expected);
});

test('Check static method getParsedRemoteUrls', async t => {
    const GitApi = proxyquire('../src/git-api', {
        'simple-git/promise': () => {
            return {
                getRemotes: async () => {
                    return [{
                        name: 'origin',
                        refs: {
                            fetch: 'https://github.com/user/test.git',
                            push: 'https://github.com/user/test.git'
                        }
                    }, {
                        name: 'myorigin',
                        refs: {
                            fetch: 'https://github.com/test-org/test.git',
                            push: 'https://github.com/test-org/test.git'
                        }
                    }];
                }
            };
        }
    });
    const actual = await GitApi.getParsedRemoteUrls();
    const expected = [{
        protocol: 'https',
        username: '',
        url: 'github.com',
        organization: 'user',
        repository: 'test'
    }, {
        protocol: 'https',
        username: '',
        url: 'github.com',
        organization: 'test-org',
        repository: 'test'
    }];
    t.deepEqual(actual, expected);
});

test('Check method getPullRequstsNumbers', async t => {
    class FakeGitHub {
        authenticate() {}
    }

    FakeGitHub.prototype.pullRequests = {
        getAll: async (options, cb) => {
            if (options.owner === 'user') {
                cb(null, {
                    data: [{
                        number: 1,
                        base: {
                            repo: {
                                owner: {
                                    login: options.owner
                                }
                            }
                        }
                    }, {
                        number: 2,
                        base: {
                            repo: {
                                owner: {
                                    login: options.owner
                                }
                            }
                        }
                    }]
                });
            } else {
                cb(null, {
                    data: [{
                        number: 11,
                        base: {
                            repo: {
                                owner: {
                                    login: options.owner
                                }
                            }
                        }
                    }, {
                        number: 22,
                        base: {
                            repo: {
                                owner: {
                                    login: options.owner
                                }
                            }
                        }
                    }]
                });
            }
        }
    };

    const GitApi = proxyquire('../src/git-api', {
        'simple-git/promise': () => {
            return {
                getRemotes: async () => {
                    return [{
                        name: 'origin',
                        refs: {
                            fetch: 'https://github.com/user/want-js-plugin.test.git',
                            push: 'https://github.com/user/want-js-plugin.test.git'
                        }
                    }, {
                        name: 'myorigin',
                        refs: {
                            fetch: 'https://github.com/test-org/want-js-plugin.test.git',
                            push: 'https://github.com/test-org/want-js-plugin.test.git'
                        }
                    }];
                },
                revparse: async () => {
                    return ' some_branch_name\n';
                }
            };
        },
        '@octokit/rest': FakeGitHub,
        'git-remote-origin-url': () => {
            return 'https://github.com/user/want-js-plugin.test.git';
        }
    });

    const gitApi = new GitApi('github.com');
    const actual = await gitApi.getPullRequestsNumbers();
    const expected = [
        { owner: 'user', number: 1 },
        { owner: 'user', number: 2 },
        { owner: 'test-org', number: 11 },
        { owner: 'test-org', number: 22 }
    ];
    t.deepEqual(actual, expected);
});

test.after(() => {
    process.env.COMMON_GITHUB_OAUTH_TOKEN = COMMON_GITHUB_OAUTH_TOKEN;
});
