export class InlineRule {
    constructor(name, pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    match(text) {
        return text.match(this.pattern);
    }
}

