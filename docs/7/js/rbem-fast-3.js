// rbem-fast.js

const INVALID_CHARS_REGEX = /[\u0000-\u0008\u000E-\u001F\u0085\u200B\u2060\u00AD\u000E\u000F]/u;
const WHITESPACE_CHARS_REGEX = /\s/u;
const IS_ONLY_WHITESPACE = new RegExp(`^(${WHITESPACE_CHARS_REGEX.source}|${INVALID_CHARS_REGEX.source})+$`, 'u');

export class RbEmFast {
  static parse(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return '';
    }

    const placeholders = { /* ... エスケープ処理は変更なし ... */ };
    let processedText = text
      .replace(/\\\\/g, `%%BS%%`)
      .replace(/\\《/g, `%%L%%`)
      .replace(/\\》/g, `%%R%%`);

    // 正規表現から [\n] の除外指定を削除し、改行も含むようにする
    const regex = new RegExp([
      `(｜)((?:《《[^》]+?》》|[^《])+)《([^》]*)》`,
      `(《《[^》]+?》》)《([^》]*)》`,
      `([一-龠〇々〆ヶヵ仝〻〼ヿ]+)《(?!《)([^》]*)》`,
      `《《([^》]*?)》》`
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
        // ★★★ 改行チェックを追加 ★★★
        if (emphasis.includes('\n')) return match;
        if (emphasis.trim() === '' || IS_ONLY_WHITESPACE.test(emphasis) || INVALID_CHARS_REGEX.test(emphasis)) return match;
        return `<em class="bouten">${emphasis}</em>`;
      }

      // --- ルビを持つパターン ---
      const base = pipeBase || emBase || shortBase;
      const rubyContent = pipeRuby || emRuby || shortRuby;

      // ★★★ 改行チェックを最優先で行う ★★★
      if (base.includes('\n') || rubyContent.includes('\n')) {
        return match;
      }

      // --- その他の無効な構文のチェック ---
      if (IS_ONLY_WHITESPACE.test(base) || INVALID_CHARS_REGEX.test(base)) return match;
      if (rubyContent.trim() === '' || IS_ONLY_WHITESPACE.test(rubyContent) || INVALID_CHARS_REGEX.test(rubyContent)) return match;

      const parts = rubyContent.split(/\||｜/);
      if (parts.length > 3) return match;

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

    return processedText
      .replace(/%%L%%/g, '《')
      .replace(/%%R%%/g, '》')
      .replace(/%%BS%%/g, '\\');
  }
}
