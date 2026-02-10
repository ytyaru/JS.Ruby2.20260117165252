export class JamlError extends Error {
    constructor(msg, cause) {
        super(msg, cause ? { cause: cause } : undefined);
        this.name = 'JamlError';
    }
}

