// rbem-fast.js

// NOTE: 初回実装ではクラス内に直接定義します。
// 将来的なリファクタリングで、この責務は別クラス(UTF8RegExpsなど)に分離される想定です。
// \u0000(NUL)は本来TextSanitizerの責務ですが、RbEmFast単体での安全性を考慮し、
// ここでは他の不正な制御文字と同様に扱います。
const INVALID_CHARS_REGEX = /[\u0000-\u0008\u000E-\u001F\u0085\u200B\u2060\u00AD\u000E\u000F]/u;
const WHITESPACE_CHARS_REGEX = /\s/u; // \s は改行文字も含む
const IS_ONLY_WHITESPACE = new RegExp(`^(${WHITESPACE_CHARS_REGEX.source}|${INVALID_CHARS_REGEX.source})+$`, 'u');

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
    };
    let processedText = text
      .replace(/\\\\/g, placeholders.escBS)
      .replace(/\\《/g, placeholders.escL)
      .replace(/\\》/g, placeholders.escR);

    // 正規表現は改行も含めて広くマッチさせる
    const regex = new RegExp([
      `(｜)((?:《《[^》]+?》》|[^《])+)《([^》]*)》`,      // パイプ付与形
      `(《《[^》]+?》》)《([^》]*)》`,                      // 強調＋ルビ形
      `([一-龠〇々〆ヶヵ仝〻〼ヿ]+)《(?!《)([^》]*)》`,      // パイプ省略形
      `《《([^》]*?)》》`                                  // 強調のみ
    ].join('|'), 'g');

    processedText = processedText.replace(regex, (
      match,
      pipe, pipeBase, pipeRuby,
      emBase, emRuby,
      shortBase, shortRuby,
      emphasis
    ) => {
      // --- 強調のみ ---
      if (emphasis !== undefined) {
        if (emphasis.includes('\n')) return match;
        if (emphasis.trim() === '' || IS_ONLY_WHITESPACE.test(emphasis) || INVALID_CHARS_REGEX.test(emphasis)) return match;
        return `<em class="bouten">${emphasis}</em>`;
      }

      // --- ルビを持つパターン ---
      const base = pipeBase || emBase || shortBase;
      const rubyContent = pipeRuby || emRuby || shortRuby;

      // --- 無効な構文のチェック ---
      // 1. 改行が含まれていれば無効
      if (base.includes('\n') || rubyContent.includes('\n')) return match;
      // 2. 不正文字 or 空白のみなら無効
      if (IS_ONLY_WHITESPACE.test(base) || INVALID_CHARS_REGEX.test(base)) return match;
      if (rubyContent.trim() === '' || IS_ONLY_WHITESPACE.test(rubyContent) || INVALID_CHARS_REGEX.test(rubyContent)) return match;

      const parts = rubyContent.split(/\||｜/);
      // 3. パイプが多すぎれば無効
      if (parts.length > 3) return match;

      // 4. 不正な空文字パターンなら無効 (ただし下ルビ記法は除く)
      const isValidDownRuby = parts.length > 1 && parts[0] === '' && parts[1].trim() !== '' && !IS_ONLY_WHITESPACE.test(parts[1]) && !INVALID_CHARS_REGEX.test(parts[1]);
      if (!isValidDownRuby) {
        if (parts.some(p => p === '' || IS_ONLY_WHITESPACE.test(p))) {
          return match;
        }
      }
      
      // --- 有効な構文のHTML変換 ---
      const parsedBase = base.replace(/《《([^》]+?)》》/g, `<em class="bouten">$1</em>`);
      const url = parts.find(p => p.startsWith('http://') || p.startsWith('https://'));
      const rubyParts = parts.filter(p => !(p.startsWith('http://') || p.startsWith('https://')));

      let overRuby = '', underRuby = '';
      if (rubyParts.length === 1) overRuby = rubyParts[0];
      else if (rubyParts.length >= 2) {
        overRuby = rubyParts[0];
        underRuby = rubyParts[1];
      }

      let result = parsedBase;
      const hasOver = overRuby.trim() !== '';
      const hasUnder = underRuby.trim() !== '';

      if (hasOver && hasUnder) {
        result = `<ruby class="under"><ruby class="over">${parsedBase}<rt>${overRuby}</rt></ruby><rt aria-hidden="true">${underRuby}</rt></ruby>`;
      } else if (hasOver) {
        result = `<ruby class="over">${parsedBase}<rt>${overRuby}</rt></ruby>`;
      } else if (!hasOver && hasUnder) {
        result = `<ruby class="under">${parsedBase}<rt>${underRuby}</rt></ruby>`;
      }

      if (url) {
        result = `<a href="${url}" target="_blank" rel="noopener noreferrer">${result}</a>`;
      }
      return result;
    });

    // プレースホルダーを元の文字に戻す
    return processedText
      .replace(new RegExp(placeholders.escL, 'g'), '《')
      .replace(new RegExp(placeholders.escR, 'g'), '》')
      .replace(new RegExp(placeholders.escBS, 'g'), '\\');
  }
}
