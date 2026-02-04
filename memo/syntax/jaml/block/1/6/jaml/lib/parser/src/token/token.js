export class Token {
    constructor(type, index, params = {}) {
        this.type = type;
        this.index = index; // [start, end]
        this.params = params;
    }
}
