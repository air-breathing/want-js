class HelperError extends Error {
    constructor(message) {
        super(message);
        this.type = 'HelperError';
    }
}

module.exports = HelperError;
