// block.js

export class Block {
    /**
     * @param {string} type - ブロック種別
     * @param {object} param - パラメータ
     * @param {[number, number]} index - [start, end] 原稿上の絶対位置
     */
    constructor(type, param = {}, index = [0, 0]) {
        this._ = { type, param, index };
    }
    get type() { return this._.type; }
    get param() { return this._.param; }
    get index() { return this._.index; }
}

// 具体的なブロック定義
export class HeadingBlock extends Block {
    constructor(level, text, id = null, index) {
        super('heading', { level, text, id }, index);
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

export class FenceBlock extends Block {
    constructor(fenceInfo, index) {
        super('fence', fenceInfo, index);
    }
}

export class FenceContext {
    static parse(fenceStr) {
        // = を除外したフェンス文字リスト
        // 対象: ! " # $ % & ' - ^ ~ @ + * ` < > ? / \
        // 正規表現用エスケープ: \ ^ $ . * + ? ( ) [ ] { } | -
        // 文字クラス[]内でのハイフンは末尾に置くかエスケープが必要
        
        const regex = /^([!"#$%&'\^~@+*`<>?/\\]{3,}|-{3,})(.*)$/;
        
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

// フェンス情報の解析ヘルパー
export class FenceContext {
    static parse(fenceStr, contentStart, contentEnd) {
        // 例: ```javascript -> fenceStr="```javascript"
        // 例: ```! warning -> fenceStr="```! warning"
        
        // 先頭のバッククォート群、記号(1文字)、残りの引数に分解
        const match = fenceStr.match(/^(`{3,})([!"#$%&'\-^~@+*<>\?\/\\\\])?(.*)$/);
        if (!match) return { valid: false };

        const [_, fence, symbol, args] = match;
        
        return {
            valid: true,
            fenceLength: fence.length,
            symbol: symbol || '', // 記号がない場合は空文字（コードブロック等）
            args: args ? args.trim() : '',
            // コンテンツのインデックス情報などを付与しても良い
        };
    }
}
