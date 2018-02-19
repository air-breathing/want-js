'use strict';
module.exports = {
    extends: "xo",
    rules: {
        indent: [2, 4, {SwitchCase: 1}],
        "quote-props": [2, "as-needed"],

        "brace-style": [2, "1tbs", {
            allowSingleLine: true
        }],
        "object-curly-spacing": [2, "always", {
            objectsInObjects: false,
            arraysInObjects: true
        }],

        strict: 2
    },
    parserOptions: {
        sourceType: "module"
    }
};
