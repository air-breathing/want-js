const git = require('simple-git/promise');
const gitRemoteOriginUrl = require('git-remote-origin-url');
const GitHubApi = require('@octokit/rest');

class GitApi {
    constructor(githubUrl, pathPrefix = '', envTokenName = 'COMMON_GITHUB_OAUTH_TOKEN') {
        this.githubUrl = githubUrl;
        this.pathPrefix = pathPrefix;
        this.envTokenName = envTokenName;
    }

    static async getBranchName() {
        return (await git().revparse(['--abbrev-ref', 'HEAD'])).trim();
    }

    static async getParsedRemoteOriginUrl() {
        const url = await gitRemoteOriginUrl();
        return GitApi._parseRemote(url);
    }

    static _parseRemote(url) {
        // eslint-disable-next-line no-useless-escape
        const commonRegExp = /(https:\/\/|git@)([a-z.\-_]+@)?([a-z.\-_]+)[:|/]([.A-Za-z0-9_\-]+)\/([.A-Za-z0-9_\-]+).git/;
        const parsedUrl = commonRegExp.exec(url);
        if (parsedUrl) {
            return {
                protocol: (parsedUrl[1] || '').replace(/(:\/\/)|@/, ''),
                username: (parsedUrl[2] || '').replace('@', ''),
                url: parsedUrl[3],
                organization: parsedUrl[4],
                repository: parsedUrl[5]
            };
        }
        console.warn(`Func _parseRemote cannot parse url ${url}`);
        return {};
    }

    static async getParsedRemoteUrls() {
        const remotes = await git().getRemotes(true);
        return remotes.map(remote => GitApi._parseRemote(remote.refs.push));
    }

    async _connectGithub() {
        const options = {
            host: this.githubUrl
        };
        if (this.pathPrefix) {
            options.pathPrefix = this.pathPrefix;
        }
        const authOptions = {
            type: 'token',
            token: process.env[this.envTokenName]
        };
        if (this.githubUrl === 'github.com') {
            delete options.pathPrefix;
            delete options.host;
        }

        this.github = new GitHubApi(options);
        this.github.authenticate(authOptions);
    }

    async getPullRequestsNumbers() {
        await this._connectGithub();
        const githubParsedUrls = await GitApi.getParsedRemoteUrls();
        const githubOriginUrl = await GitApi.getParsedRemoteOriginUrl();
        const branch = await GitApi.getBranchName();
        const preResult = await Promise.all(githubParsedUrls.map(async githubParsedUrl => {
            const ghPromise = new Promise((resolve, reject) => {
                if (githubParsedUrl.url !== this.githubUrl) {
                    console.warn(`Remote ${githubParsedUrl.url} differs from choosen api ${this.githubUrl}`);
                    return resolve([]);
                }
                this.github.pullRequests.getAll({
                    state: 'all',
                    owner: githubParsedUrl.organization,
                    repo: githubParsedUrl.repository,
                    head: `${githubOriginUrl.organization}:${branch}`
                }, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.data);
                    }
                });
            });
            const resData = await ghPromise;
            return resData.map(function (pullReqData) {
                return {
                    owner: pullReqData.base.repo.owner.login,
                    number: pullReqData.number
                };
            });
        }));
        return Array.prototype.concat.apply([], preResult);
    }
}

module.exports = GitApi;
