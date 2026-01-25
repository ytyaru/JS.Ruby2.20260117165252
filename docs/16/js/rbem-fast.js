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
  /**
   * 指定されたテキストを解析し、HTML文字列に変換します。（パフォーマンス優先版）
   * 無効な構文は変換せず、元のテキストのまま残します。
   * @param {string} text - 変換対象の元原稿テキスト。
   * @returns {string} 変換後のHTML文字列。
   */
  static parse(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return '';
    }

    // エスケープされた文字を一時的なプレースホルダーに置き換える
    const placeholders = {
      escBS: `%%${Date.now()}_BS%%`,
      escL: `%%${Date.now()}_L%%`,
      escR: `%%${Date.now()}_R%%`,
      escP: `%%${Date.now()}_P%%`, // \｜ のためのプレースホルダー
    };
    let processedText = text
      .replace(/\\\\/g, placeholders.escBS)
      .replace(/\\《/g, placeholders.escL)
      .replace(/\\》/g, placeholders.escR)
      .replace(/\\｜/g, placeholders.escP); // \｜ を置換


    // 正規表現の優先順位を再定義し、各パターンのキャプチャを単純化
    const regex = new RegExp([
      `(《《[^》]*?》》)《([^》]*)》`,                      // 1. 強調＋ルビ形
      `(｜)([^《]*)《([^》]*)》`,                          // 2. パイプ付与形 (親文字は《を含まない)
      `([一-龠〇々〆ヶヵ仝〻〼ヿ]+)《(?!《)([^》]*)》`,      // 3. パイプ省略形
      `《《([^》]*?)》》`                                  // 4. 強調のみ
    ].join('|'), 'g');

    processedText = processedText.replace(regex, (
      match,
      emBase, emRuby,
      pipe, pipeBase, pipeRuby,
      shortBase, shortRuby,
      emphasis
    ) => {
      // ガード節: どのパターンにもマッチしなかった場合は即座にリターン
      if (emBase === undefined && pipe === undefined && shortBase === undefined && emphasis === undefined) {
        return match;
      }

      // --- 4. 強調のみ ---
      if (emphasis !== undefined) {
        if (emphasis.includes('\n') || /[《》｜]/.test(emphasis)) return match;
        if (emphasis.trim() === '' || IS_ONLY_WHITESPACE.test(emphasis) || INVALID_CHARS_REGEX.test(emphasis)) return match;
        return `<em class="bouten">${emphasis}</em>`;
      }

      // --- 1, 2, 3. ルビを持つパターン ---
      const base = emBase || pipeBase || shortBase;
      const rubyContent = emRuby || pipeRuby || shortRuby;

      // --- 無効な構文のチェック ---
      if (base.includes('\n') || rubyContent.includes('\n')) return match;
      if (IS_ONLY_WHITESPACE.test(base) || INVALID_CHARS_REGEX.test(base)) return match;
      if (rubyContent.trim() === '' && !rubyContent.includes('|')) return match;
      if (INVALID_CHARS_REGEX.test(rubyContent)) return match;
      
      // 親文字内のメタ文字チェック (em構文は除く)
      const baseWithoutEm = base.replace(/《《[^》]*?》》/g, '');
      if (/[《》｜]/.test(baseWithoutEm)) return match;

      // ルビの中身のメタ文字チェック
      if (/[《》]/.test(rubyContent)) return match;
      if (rubyContent.replace(/\|/g, '').includes('|')) return match; // 3つ以上のパイプ

      const tempParts = rubyContent.split(/\||｜/);
      const urls = tempParts.filter(p => isValidUrl(p));
      if (urls.length > 1) return match;
      const url = urls[0];
      
      const rubyParts = tempParts.filter(p => !isValidUrl(p));
      if ((url && rubyParts.length > 2) || (!url && rubyParts.length > 2)) return match; // rubyPartsは最大2つまで

      const isValidDownRuby = rubyParts.length === 2 && rubyParts[0] === '' && rubyParts[1].trim() !== '' && !IS_ONLY_WHITESPACE.test(rubyParts[1]);
      if (!isValidDownRuby) {
        if (rubyParts.some(p => p === '' || IS_ONLY_WHITESPACE.test(p))) {
          return match;
        }
      }
      
      // --- 有効な構文のHTML変換 ---
      const parsedBase = base.replace(/《《([^》]*?)》》/g, (m, emContent) => {
          if (emContent.includes('\n') || /[《》｜]/.test(emContent)) {
              hasInvalidMetaInBase = true; // このフラグは実際には不要になるが念のため
          }
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
    });

    // プレースホルダーを元の文字に戻す処理に `escP` を追加
    return processedText
      .replace(new RegExp(placeholders.escL, 'g'), '《')
      .replace(new RegExp(placeholders.escR, 'g'), '》')
      .replace(new RegExp(placeholders.escP, 'g'), '｜') // ｜ を戻す
      .replace(new RegExp(placeholders.escBS, 'g'), '\\');
  }
}
