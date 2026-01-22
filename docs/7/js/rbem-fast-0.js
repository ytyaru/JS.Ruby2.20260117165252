// rbem-fast.js

// RbEmの構文要素として無効と判断するための、すべての空白・制御文字の正規表現
// NOTE: 初回実装ではクラス内に直接定義する（将来的なリファクタリングで分離）
const WHITESPACE_AND_CONTROL_CHARS = /[\s\u0085\u200B\u2060\u00AD\u000E\u000F\u0000-\u0008\u000E-\u001F]/u;
const IS_ONLY_WHITESPACE = new RegExp(`^(${WHITESPACE_AND_CONTROL_CHARS.source})+$`, 'u');

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

    const regex = new RegExp([
      `(｜)((?:《《[^》]+?》》|[^《])+?)《([^》]*)》`,
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
        if (emphasis.trim() === '') return match; // 空文字は変換しない
        return `<em class="bouten">${emphasis}</em>`;
      }

      // --- ルビを持つパターン ---
      const base = pipeBase || emBase || shortBase;
      const rubyContent = pipeRuby || emRuby || shortRuby;

      // --- 無効な構文のチェック ---
      if (base.trim() === '' || IS_ONLY_WHITESPACE.test(base)) return match;
      if (rubyContent.trim() === '') return match;

      const parts = rubyContent.split(/\||｜/);
      if (parts.length > 3) return match; // パイプが多すぎる

      // 「空文字」「空白文字のみ」の厳密なチェック
      const isValidDownRuby = parts.length > 1 && parts[0] === '' && parts[1].trim() !== '' && !IS_ONLY_WHITESPACE.test(parts[1]);
      if (!isValidDownRuby && parts.some(p => p.trim() === '' || IS_ONLY_WHITESPACE.test(p))) {
        return match;
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
      } else if (!hasOver && hasUnder) { // 下ルビのみのケース
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
