// RbEm.js
export class RbEm {
  /**
   * 指定されたテキストを解析し、HTML文字列に変換します。
   * @param {string} text - 変換対象の元原稿テキスト。
   * @throws {Error} インライン要素の構文内に改行文字が含まれている場合。
   * @returns {string} 変換後のHTML文字列。
   */
  static parse(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return '';
    }

    // エスケープ処理
    const placeholders = {
      escBS: `%%ESC_BS_${Date.now()}%%`,
      escL: `%%ESC_L_${Date.now()}%%`,
      escR: `%%ESC_R_${Date.now()}%%`,
      escP: `%%ESC_P_${Date.now()}%%`,
    };
    let processedText = text
      .replace(/\\\\/g, placeholders.escBS)
      .replace(/\\《/g, placeholders.escL)
      .replace(/\\》/g, placeholders.escR)
      .replace(/\\｜/g, placeholders.escP);

    // 改行を含まないように正規表現を修正
    const regex = new RegExp([
      `(｜)((?:《《[^》\\n]+?》》|[^《\\n])+)《([^》\\n]*)》`,
      `(《《[^》\\n]+?》》)《([^》\\n]*)》`,
      `([一-龠〇々〆ヶヵ仝〻〼ヿ]+)《(?!《)([^》\\n]*)》`,
      `《《([^》\\n]*?)》》`
    ].join('|'), 'g');

    // 先に改行エラーをチェックする
    const syntaxErrorRegex = /(?:[一-龠〇々〆ヶヵ仝〻〼ヿ]+|｜(?:《《[^》]+?》》|[^《])+?|《《[^》]+?》》)《[^》]*\n[^》]*》|《《[^》]*\n[^》]*》》/g;
    if (syntaxErrorRegex.test(processedText)) {
      throw new Error('インライン要素の構文内に改行文字を含めることはできません。');
    }

    processedText = processedText.replace(regex, (
      match,
      pipe, pipeBase, pipeRuby,
      emBase, emRuby,
      shortBase, shortRuby,
      emphasis
    ) => {
      // --- 強調 ---
      if (emphasis !== undefined) {
        if (emphasis.trim() === '') return match; // 空白のみの場合は変換しない
        return `<em class="bouten">${emphasis}</em>`;
      }

      // --- ルビ ---
      const base = pipeBase || emBase || shortBase;
      const rubyContent = pipeRuby || emRuby || shortRuby;

      if (rubyContent === undefined || rubyContent.trim() === '') return match;

      const parsedBase = base.replace(/《《([^》\n]*?)》》/g, (m, em) =>
        em.trim() === '' ? match : `<em class="bouten">${em}</em>`
      );

      const parts = rubyContent.split(/\||｜/);
      const url = parts.find(p => p.startsWith('http://') || p.startsWith('https://'));
      const rubyParts = parts.filter(p => !(p.startsWith('http://') || p.startsWith('https://')));

      let overRuby = '', underRuby = '';
      if (rubyParts.length === 1) overRuby = rubyParts[0];
      else if (rubyParts.length >= 2) {
        overRuby = rubyParts[0];
        underRuby = rubyParts[1];
      }

      let result = parsedBase;
      const hasOver = overRuby && overRuby.trim() !== '';
      const hasUnder = underRuby && underRuby.trim() !== '';

      if (hasOver && hasUnder) {
        result = `<ruby class="under"><ruby class="over">${parsedBase}<rt>${overRuby}</rt></ruby><rt aria-hidden="true">${underRuby}</rt></ruby>`;
      } else if (hasOver) {
        result = `<ruby class="over">${parsedBase}<rt>${overRuby}</rt></ruby>`;
      } else if (hasUnder) {
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
      .replace(new RegExp(placeholders.escP, 'g'), '｜')
      .replace(new RegExp(placeholders.escBS, 'g'), '\\');
  }
}
