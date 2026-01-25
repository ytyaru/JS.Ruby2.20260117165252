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

    // エスケープ処理は最初に行う
    const placeholders = { /* ... */ };
    let processedText = text
      .replace(/\\\\/g, `%%BS%%`)
      .replace(/\\《/g, `%%L%%`)
      .replace(/\\》/g, `%%R%%`)
      .replace(/\\｜/g, `%%P%%`);

    let result = '';
    let lastIndex = 0;

    // テキストを1文字ずつスキャンしていく
    for (let i = 0; i < processedText.length; i++) {
      const char = processedText[i];
      let syntaxMatch = null;

      // 構文の開始点を探す
      if (char === '《' && processedText[i + 1] === '《') {
        syntaxMatch = this.findEmphasis(processedText, i);
      } else if (char === '《') {
        syntaxMatch = this.findRuby(processedText, i, 'short');
      } else if (char === '｜' && processedText[i + 1] !== '《') { // パイプ付与形
         const tempMatch = this.findRuby(processedText, i, 'pipe');
         if (tempMatch) {
            // 強調+ルビのパターン 《《...》》《...》 を優先する
            const empRubyMatch = this.findEmphasisRuby(processedText, i);
            if (empRubyMatch && empRubyMatch.end > tempMatch.end) {
                syntaxMatch = empRubyMatch;
            } else {
                syntaxMatch = tempMatch;
            }
         }
      }
      
      if (syntaxMatch) {
        // マッチしなかった部分を追加
        result += processedText.substring(lastIndex, syntaxMatch.start);
        
        try {
          const converted = this.parseSyntax(syntaxMatch.syntax);
          result += converted;
        } catch (e) {
          result += syntaxMatch.syntax; // 無効ならそのまま
        }
        
        i = syntaxMatch.end - 1; // スキャン位置をジャンプ
        lastIndex = syntaxMatch.end;
      }
    }

    // 最後の残りテキストを追加
    result += processedText.substring(lastIndex);

    // プレースホルダーを元に戻す
    return result
      .replace(/%%L%%/g, '《')
      .replace(/%%R%%/g, '》')
      .replace(/%%P%%/g, '｜')
      .replace(/%%BS%%/g, '\\');
  }

  // --- 以下、ヘルパーメソッド ---

  static findEmphasis(text, start) {
    const end = text.indexOf('》》', start + 2);
    if (end === -1) return null;
    return { syntax: text.substring(start, end + 2), start, end: end + 2 };
  }
  
  static findEmphasisRuby(text, start) {
      // 親文字が《《...》》であるパターンを探す
      const empEnd = text.indexOf('》》', start);
      if (empEnd === -1) return null;
      if (text[empEnd + 2] !== '《') return null;
      const rubyEnd = text.indexOf('》', empEnd + 3);
      if (rubyEnd === -1) return null;
      return { syntax: text.substring(start, rubyEnd + 1), start, end: rubyEnd + 1 };
  }

  static findRuby(text, start, type) {
    let baseEnd = -1;
    // 親文字の終わりを探す
    for (let i = start + (type === 'pipe' ? 1 : 0); i < text.length; i++) {
        if (text[i] === '《') {
            // 《《 のパターンは親文字の一部として許容
            if (text[i+1] === '《') {
                const close = text.indexOf('》》', i + 2);
                if (close !== -1) {
                    i = close + 1;
                    continue;
                }
            }
            baseEnd = i;
            break;
        }
    }
    if (baseEnd === -1) return null;

    const rubyEnd = text.indexOf('》', baseEnd + 1);
    if (rubyEnd === -1) return null;
    
    const syntax = text.substring(start, rubyEnd + 1);

    // パイプ省略形の漢字チェック
    if (type === 'short') {
        const base = syntax.slice(0, syntax.indexOf('《'));
        if (!/^[一-龠〇々〆ヶヵ仝〻〼ヿ]+$/.test(base)) {
            return null;
        }
    }

    return { syntax, start, end: rubyEnd + 1 };
  }
  /**
   * 単一の構文候補文字列を解析し、HTMLに変換する。
   * 無効な場合はErrorをスローする。
   * @param {string} syntax - 構文候補の文字列
   * @returns {string} 変換後のHTML文字列
   */
  static parseSyntax(syntax) {
    // --- 強調構文の解析 ---
    if (syntax.startsWith('《《') && syntax.endsWith('》》')) {
      const emphasis = syntax.slice(2, -2);
      if (emphasis.includes('\n') || /[《》｜]/.test(emphasis)) throw new Error('Invalid meta chars');
      if (emphasis.trim() === '' || IS_ONLY_WHITESPACE.test(emphasis) || INVALID_CHARS_REGEX.test(emphasis)) throw new Error('Invalid content');
      return `<em class="bouten">${emphasis}</em>`;
    }

    // --- ルビ構文の解析 ---
    const openBracketIndex = syntax.lastIndexOf('《');
    const closeBracketIndex = syntax.lastIndexOf('》');
    if (openBracketIndex === -1 || closeBracketIndex === -1 || openBracketIndex > closeBracketIndex) {
      throw new Error('Invalid bracket structure');
    }

    const base = syntax.slice(0, openBracketIndex);
    const rubyContent = syntax.slice(openBracketIndex + 1, closeBracketIndex);

    // --- 無効な構文のチェック ---
    if (base.includes('\n') || rubyContent.includes('\n')) throw new Error('Contains newline');
    if (INVALID_CHARS_REGEX.test(base) || INVALID_CHARS_REGEX.test(rubyContent)) throw new Error('Contains invalid chars');
    
    const baseWithoutPipe = base.startsWith('｜') ? base.slice(1) : base;
    if (/[《》｜]/.test(baseWithoutPipe.replace(/《《[^》]*?》》/g, ''))) throw new Error('Invalid meta chars in base');

    const tempParts = rubyContent.split(/\||｜/);
    const urls = tempParts.filter(p => isValidUrl(p));
    if (urls.length > 1) throw new Error('Multiple URLs');
    const url = urls[0];
    
    const rubyParts = tempParts.filter(p => !isValidUrl(p));
    if ((url && rubyParts.length > 2) || (!url && rubyParts.length > 2)) throw new Error('Too many ruby parts');

    const isValidDownRuby = rubyParts.length === 2 && rubyParts[0] === '' && rubyParts[1].trim() !== '' && !IS_ONLY_WHITESPACE.test(rubyParts[1]);
    if (!isValidDownRuby) {
      if (rubyParts.some(p => p === '' || IS_ONLY_WHITESPACE.test(p))) {
        throw new Error('Invalid empty or whitespace-only parts');
      }
    }
    
    // --- 有効な構文のHTML変換 ---
    const parsedBase = baseWithoutPipe.replace(/《《([^》]*?)》》/g, (m, emContent) => {
        if (emContent.includes('\n') || /[《》｜]/.test(emContent)) throw new Error('Invalid meta chars in emphasis');
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

