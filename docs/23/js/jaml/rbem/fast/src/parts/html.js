export class Html {// 抽出された要素からHTMLテキストを生成する
    static get Ruby(base, over, under) {return RubyHtml.to(base, over, under)}
    static get Em(text) {return EmHtml.to(text)}
    static get A(text, href) {return AHtml.to(text, href)}
}
// 以下実装
const isStr = (v)=>'string'===typeof v;
class RubyHtml {
    static to(base, over, under) {
        if ('base over under'.split(' ').some(v=>!isStr(window[v]))) {throw new TypeError()}
        if (0===base.length) {throw new JamlError(`親文字が空文字です。親文字は1字以上必要です。`)}
        if ('over under'.split(' ').every(v=>0===window[v].length)) {throw new JamlError(`ルビ文字が空文字です。ルビ文字は上下少なくとも一方、1字以上必要です。`)}
        const N = over && under ? 'Both' : (over ? 'Over' : 'Under');
        return this[`_${N}`](base, 'Under'===N ? under : over, under);
    }
    static _toOver(rb, rt) {return this._toSolo(rb, rt, 'over')}
    static _toUnder(rb, rt) {return this._toSolo(rb, rt, 'under')}
    // 将来モノルビ、熟語ルビも拡張する。現在はグループルビのみなので単純な実装で済む。
    static _toSolo(rb, rt, pos) {return `<ruby class="${pos}">${RtHtml.to(rb, rt)}</ruby>`}
    static _toBoth(rb, rtO, rtU) {return this._toSolo(this._toSolo(rb, rtO, 'over'), rtU, 'under')}
}
class RtHtml {
    static to(rb, rt) {return `${rb}<rt>${rt}</rt>`}
}
class EmHtml {
    static to(text) {return `<em class="bouten">${text}</em>`}
}
class AHtml {
    static to(text, href) {return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`}
}

