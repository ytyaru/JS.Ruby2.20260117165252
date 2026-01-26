import { JamlError } from './error.js'; // JamlErrorをインポート
export class Html {// 抽出された要素からHTMLテキストを生成する
    static ruby(base, over, under) {return RubyHtml.to(base, over, under)}
    static em(text) {return EmHtml.to(text)}
    static a(text, href) {return AHtml.to(text, href)}
}
// 以下実装
const isStr = (v)=>'string'===typeof v;
class RubyHtml {
    static to(base, over, under) {
        if ([base,over,under].some(v=>!isStr(v))) {throw new TypeError(`型が違います。String値であるべきです。`)}
        if (0===base.length) {throw new JamlError(`親文字が空文字です。親文字は1字以上必要です。`)}
        if ([over,under].every(v=>0===v.length)) {throw new JamlError(`ルビ文字が空文字です。ルビ文字は上下少なくとも一方に1字以上の文字が必要です。`)}
        const N = ((over && under) ? 'Both' : (over ? 'Over' : 'Under'));
        return (this[`_to${N}`])(base, 'Under'===N ? under : over, under);
    }
    static _toOver(rb, rt) {return this._toSolo(rb, rt, 'over')}
    static _toUnder(rb, rt) {return this._toSolo(rb, rt, 'under')}
    // 将来モノルビ、熟語ルビも拡張する。現在はグループルビのみなので単純な実装で済む。
    static _toSolo(rb, rt, pos, isAriaHidden=false) {return `<ruby class="${pos}">${RtHtml.to(rb, rt, isAriaHidden)}</ruby>`}
    static _toBoth(rb, rtO, rtU) {return this._toSolo(this._toSolo(rb, rtO, 'over'), rtU, 'under', true)}
}
class RtHtml {
    static to(rb, rt, isAriaHidden=false) {return `${rb}<rt${isAriaHidden ? ' aria-hidden="true"' : ''}>${rt}</rt>`}
}
class EmHtml {
    static to(text) {
        if (!isStr(text)) {throw new TypeError(`型が違います。String値であるべきです。`)}
        if (0===text.length) {throw new JamlError(`強調テキストが空文字です。1字以上の文字が必要です。`)}
        return `<em class="bouten">${text}</em>`
    }
}
class AHtml {
    static to(text, href) {
        if ([text, href].some(v=>!isStr(v))) {throw new TypeError(`型が違います。String値であるべきです。`)}
        if ([text, href].some(v=>0===v.length)) {throw new JamlError(`テキストかhrefが空文字です。両方共1字以上の文字が必要です。`)}
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
    }
}

