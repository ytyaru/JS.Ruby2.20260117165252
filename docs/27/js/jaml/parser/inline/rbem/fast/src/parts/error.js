export class JamlError extends Error {
    constructor(message, cause) {
        super(message, cause instanceof Error ? {cause:cause} : undefined);
        this.name = 'JamlError';
    }
}
