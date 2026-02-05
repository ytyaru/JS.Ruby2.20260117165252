export class FenceRule {
    constructor(name, pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    match(line) {
        return line.match(this.pattern);
    }
}

