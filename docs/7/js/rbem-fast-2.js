// rbem-fast.js

const INVALID_CHARS_REGEX = /[\u0000-\u0008\u000E-\u001F\u0085\u200B\u2060\u00AD\u000E\u000F]/u;
const WHITESPACE_CHARS_REGEX = /\s/u; // \s は改行も含む
const IS_ONLY_WHITESPACE = new RegExp(`^(${WHITESPACE_CHARS_REGEX.source}|${INVALID_CHARS_REGEX.source})+$`, 'u');

export class RbEmFast {
  static parse(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return '';
    }

    const placeholders = {
      escBS: `%%${Date.now()}_BS%%`,
      escL: `%%${Date.now()}_L%%`,
      escR: `%%${Date.now()}_R%%`,
    };
    let processedText = text
      .replace(/\\\\/g, placeholders.escBS)
      .replace(/\\《/g, placeholders.escL)
      .replace(/\\》/g, placeholders.escR);

    // 正規表現内のすべての [^...] に \n を追加し、改行を明確に除外
    const regex = new RegExp([
      `(｜)((?:《《[^》\\n]+?》》|[^《\\n])+)《([^》\\n]*)》`,
      `(《《[^》\\n]+?》》)《([^》\\n]*)》`,
      `([一-龠〇々〆ヶヵ仝〻〼ヿ]+)《(?!《)([^》\\n]*)》`,
      `《《([^》\\n]*?)》》`
    ].join('|'), 'g');

    processedText = processedText.replace(regex, (
      match,
      pipe, pipeBase, pipeRuby,
      emBase, emRuby,
      shortBase, shortRuby,
      emphasis
    ) => {
      if (emphasis !== undefined) {
        if (emphasis.trim() === '' || IS_ONLY_WHITESPACE.test(emphasis) || INVALID_CHARS_REGEX.test(emphasis)) return match;
        return `<em class="bouten">${emphasis}</em>`;
      }

      const base = pipeBase || emBase || shortBase;
      const rubyContent = pipeRuby || emRuby || shortRuby;

      if (IS_ONLY_WHITESPACE.test(base) || INVALID_CHARS_REGEX.test(base)) return match;
      if (rubyContent.trim() === '' || IS_ONLY_WHITESPACE.test(rubyContent) || INVALID_CHARS_REGEX.test(rubyContent)) return match;

      const parts = rubyContent.split(/\||｜/);
      if (parts.length > 3) return match;

      const isValidDownRuby = parts.length > 1 && parts[0] === '' && parts[1].trim() !== '' && !IS_ONLY_WHITESPACE.test(parts[1]) && !INVALID_CHARS_REGEX.test(parts[1]);
      if (!isValidDownRuby) {
        // 下ルビ記法以外のケースで、空文字または空白のみの要素があれば無効
        if (parts.some(p => p === '' || IS_ONLY_WHITESPACE.test(p))) {
          return match;
        }
      }
      
      const parsedBase = base.replace(/《《([^》\n]+?)》》/g, `<em class="bouten">$1</em>`);
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
      .replace(new RegExp(placeholders.escL, 'g'), '《')
      .replace(new RegExp(placeholders.escR, 'g'), '》')
      .replace(new RegExp(placeholders.escBS, 'g'), '\\');
  }
}
