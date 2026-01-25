// rbem-fast.js

// NOTE: 初回実装ではクラス内に直接定義します。
// 将来的なリファクタリングで、この責務は別クラス(UTF8RegExpsなど)に分離される想定です。
// \u0000(NUL)は本来TextSanitizerの責務ですが、RbEmFast単体での安全性を考慮し、
// ここでは他の不正な制御文字と同様に扱います。
const INVALID_CHARS_REGEX = /[\u0000-\u0008\u000E-\u001F\u0085\u200B\u2060\u00AD\u000E\u000F]/u;
const WHITESPACE_CHARS_REGEX = /\s/u; // \s は改行文字も含む
const IS_ONLY_WHITESPACE = new RegExp(`^(${WHITESPACE_CHARS_REGEX.source}|${INVALID_CHARS_REGEX.source})+$`, 'u');
// <a>のhrefにおける有効なURL判定。将来この債務は別クラス(SlashSchemeURL,ColonSchemeURL等)に分離される想定。
const ALLOWED_SCHEMES = {slashes:['https', 'http'], colons:['mailto', 'tel']};
const isValidUrl = (text) => {
    for (let section of ['slashes', 'colons']) {
        if (ALLOWED_SCHEMES[section].some(scheme => text.startsWith(`${scheme}:${section === 'slashes' ? '//' : ''}`))) {
            return true;
        }
    }
    return false;
};

export class RbEmFast {
  static parse(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return '';
    }

    const placeholders = {
      escBS: `%%${Date.now()}_BS%%`,
      escL: `%%${Date.now()}_L%%`,
      escR: `%%${Date.now()}_R%%`,
      escP: `%%${Date.now()}_P%%`,
    };
    let processedText = text
      .replace(/\\\\/g, placeholders.escBS)
      .replace(/\\《/g, placeholders.escL)
      .replace(/\\》/g, placeholders.escR)
      .replace(/\\｜/g, placeholders.escP);

    let result = '';
    let lastIndex = 0;
    const regex = /[｜《]/g; // 構文の開始点となりうる文字だけを探す
    let match;

    while ((match = regex.exec(processedText)) !== null) {
      const char = match[0];
      const i = match.index;

      // 既に処理済みの範囲ならスキップ
      if (i < lastIndex) continue;

      let syntaxMatch = null;
      if (char === '《' && processedText[i + 1] === '《') {
        syntaxMatch = this.findEmphasisOrEmphasisRuby(processedText, i);
      } else if (char === '｜') {
        syntaxMatch = this.findRuby(processedText, i, 'pipe');
      } else if (char === '《') {
        syntaxMatch = this.findRuby(processedText, i, 'short');
      }
      
      if (syntaxMatch) {
        result += processedText.substring(lastIndex, syntaxMatch.start);
        try {
          const converted = this.parseSyntax(syntaxMatch.syntax);
          result += converted;
        } catch (e) {
          result += syntaxMatch.syntax;
        }
        lastIndex = syntaxMatch.end;
        regex.lastIndex = lastIndex; // 次の検索開始位置を更新
      }
    }

    result += processedText.substring(lastIndex);

    return result
      .replace(new RegExp(placeholders.escL, 'g'), '《')
      .replace(new RegExp(placeholders.escR, 'g'), '》')
      .replace(new RegExp(placeholders.escP, 'g'), '｜')
      .replace(new RegExp(placeholders.escBS, 'g'), '\\');
  }

  static findEmphasisOrEmphasisRuby(text, start) {
    const empEnd = text.indexOf('》》', start + 2);
    if (empEnd === -1) return null;
    // 強調+ルビ 《《...》》《...》 の可能性をチェック
    if (text[empEnd + 2] === '《') {
      const rubyEnd = text.indexOf('》', empEnd + 3);
      if (rubyEnd !== -1) {
        return { syntax: text.substring(start, rubyEnd + 1), start, end: rubyEnd + 1 };
      }
    }
    // 強調のみ
    return { syntax: text.substring(start, empEnd + 2), start, end: empEnd + 2 };
  }

  static findRuby(text, start, type) {
    const baseStartIndex = type === 'pipe' ? start + 1 : start;
    const openBracketIndex = text.indexOf('《', baseStartIndex);
    if (openBracketIndex === -1) return null;

    // パイプ付与形で、親文字に《が含まれるのは不正 (ただし《《は許容されるべきだが、それはparseSyntaxで判定)
    if (type === 'pipe' && openBracketIndex !== baseStartIndex) {
        const baseCandidate = text.substring(baseStartIndex, openBracketIndex);
        if (baseCandidate.includes('《')) return null;
    }

    const closeBracketIndex = text.indexOf('》', openBracketIndex + 1);
    if (closeBracketIndex === -1) return null;

    const syntax = text.substring(start, closeBracketIndex + 1);
    
    if (type === 'short') {
      const base = syntax.slice(0, syntax.indexOf('《'));
      if (!/^[一-龠〇々〆ヶヵ仝〻〼ヿ]+$/.test(base)) return null;
    }
    return { syntax, start, end: closeBracketIndex + 1 };
  }

  static parseSyntax(syntax) {
    if (syntax.startsWith('《《') && syntax.endsWith('》》')) {
      const emphasis = syntax.slice(2, -2);
      if (emphasis.includes('\n') || /[《》｜]/.test(emphasis)) throw new Error();
      if (emphasis.trim() === '' || IS_ONLY_WHITESPACE.test(emphasis) || INVALID_CHARS_REGEX.test(emphasis)) throw new Error();
      return `<em class="bouten">${emphasis}</em>`;
    }

    const openBracketIndex = syntax.lastIndexOf('《');
    const basePart = syntax.slice(0, openBracketIndex);
    const rubyContent = syntax.slice(openBracketIndex + 1, -1);

    if (basePart.includes('\n') || rubyContent.includes('\n')) throw new Error();
    if (INVALID_CHARS_REGEX.test(basePart) || INVALID_CHARS_REGEX.test(rubyContent)) throw new Error();
    
    const base = basePart.startsWith('｜') ? basePart.slice(1) : basePart;
    if (base.trim() === '' && !basePart.startsWith('｜')) throw new Error(); // パイプ省略形で親文字が空白はNG
    if (base.trim() === '' && basePart.startsWith('｜')) { // ｜《...》
        if (rubyContent.trim() === '') throw new Error();
    }

    const baseWithoutEm = base.replace(/《《[^》]*?》》/g, '');
    if (/[《》｜]/.test(baseWithoutEm)) throw new Error();

    const tempParts = rubyContent.split(/\||｜/);
    const urls = tempParts.filter(p => isValidUrl(p));
    if (urls.length > 1) throw new Error();
    const url = urls[0];
    
    const rubyParts = tempParts.filter(p => !isValidUrl(p));
    if ((url && rubyParts.length > 2) || (!url && rubyParts.length > 2)) throw new Error();

    const isValidDownRuby = rubyParts.length === 2 && rubyParts[0] === '' && rubyParts[1].trim() !== '' && !IS_ONLY_WHITESPACE.test(rubyParts[1]);
    if (!isValidDownRuby) {
      if (rubyParts.some(p => p === '' || IS_ONLY_WHITESPACE.test(p))) {
        throw new Error();
      }
    }
    
    const parsedBase = base.replace(/《《([^》]*?)》》/g, (m, emContent) => {
        if (emContent.includes('\n') || /[《》｜]/.test(emContent)) throw new Error();
        return `<em class="bouten">${emContent}</em>`;
    });
    
    let rubyHtml = '';
    const actualRubyTexts = rubyParts.filter(p => p.trim() !== '');

    if (isValidDownRuby) {
        rubyHtml = `<ruby class="under">${parsedBase}<rt>${rubyParts[1]}</rt></ruby>`;
    } else if (actualRubyTexts.length === 2) {
        rubyHtml = `<ruby class="under"><ruby class="over">${parsedBase}<rt>${actualRubyTexts[0]}</rt></ruby><rt aria-hidden="true">${actualRubyTexts[1]}</rt></ruby>`;
    } else if (actualRubyTexts.length === 1) {
        rubyHtml = `<ruby class="over">${parsedBase}<rt>${actualRubyTexts[0]}</rt></ruby>`;
    }

    let result = rubyHtml || parsedBase;
    if (url) {
      result = `<a href="${url}" target="_blank" rel="noopener noreferrer">${result}</a>`;
    }
    return result;
  }
}

