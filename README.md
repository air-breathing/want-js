# want-js
[![Build Status](https://travis-ci.org/air-breathing/want-js.svg?branch=master)](https://travis-ci.org/air-breathing/want-js)
Tool for quick opening services

Install and write your config for quick opening services.

For example:
0. Install in project `npm i want-js --save` or `npm i want-js --global`.
1. Create in your project or home directory file `.want-js.config.js`;
2. Describe commands that you want to open in config, for example, you want to open Github's page of project; 

`.want-js.config.js`
```js
module.exports = {
    commandParams: {
        gt: {
            executor: `${__dirname}/commands/github.js`,
            summary: 'Open github.',
            aliases: ['github']
        },
        tr: {
            executor: `${__dirname}/commands/travis.js`,
            someData: {
                a: 1,
                b: 2
            },
            summary: 'Open travis.',
            aliases: ['travis']
        },
        ...
    }
}
```

In this example you must describe `Object` with property `commandParams`. `commandParams` is `Object` which consists of different commands.

A name of property is one of the names some commands. 
For every command describes executor, we must write path in configs to command's js-file.
Also we can add aliases of command and description in readme.

For every command describing `Object` will represent as data in command js-file.
```js
const getParsedRemoteOriginUrl = require('./libs/get-parsed-remote-origin-url');

module.exports = async function (data) {
    const parsedUrl = await getParsedRemoteOriginUrl();
    if (parsedUrl) {
        const siteUrl = data.siteUrl || parsedUrl[2];
        return `https://${siteUrl}/${parsedUrl[3]}/${parsedUrl[4]}`;
    }
};
```
Command function can be async or not.
```js
module.exports = function (data) {
    // some action
    return resultString; // return resultArray;
};
```
Function must return `String`, `Array<String>` or `Promise` which return `String` or `Array<String>`.

After all you may do in project or in all projects(if you install globally):
```bash
want gt
```

or

```bash
want github
```