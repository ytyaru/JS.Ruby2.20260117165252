// block.js

export class Block {
    constructor(type, param = {}, index = [0, 0]) {
        this._ = { type, param, index };
        // HTML変換後のキャッシュ用（BlockParserが使用）
        this.html = null; 
    }
    get type() { return this._.type; }
    get param() { return this._.param; }
    get index() { return this._.index; }
}

export class HeadingBlock extends Block {
    constructor(level, text, index) {
        super('heading', { level, text }, index);
    }
}

export class ParagraphBlock extends Block {
    constructor(index) {
        super('paragraph', {}, index);
    }
}

export class HrBlock extends Block {
    constructor(index) {
        super('hr', {}, index);
    }
}

export class PagingBlock extends Block {
    constructor(index) {
        super('paging', {}, index);
    }
}

export class PartBlock extends Block {
    constructor(path, index) {
        super('part', { path }, index);
    }
}

export class FenceBlock extends Block {
    constructor(fenceInfo, index) {
        super('fence', fenceInfo, index);
    }
}

export class FenceContext {
    static parse(fenceStr) {
        // フェンス文字リスト: ! " # $ % & ' - ^ ~ @ + * ` < > ? / \
        // 正規表現のエスケープ: \ ^ $ . * + ? ( ) [ ] { } | -
        // 特にハイフン(-)とバックスラッシュ(\)のエスケープに注意
        const regex = /^([!"#$%&'\-^~@+*`<>?/\\]{3,})(.*)$/;
        
        const match = fenceStr.match(regex);
        if (!match) return { valid: false };

        const [_, fence, args] = match;
        
        return {
            valid: true,
            fenceLength: fence.length,
            symbol: fence.charAt(0),
            args: args ? args.trim() : ''
        };
    }
}
