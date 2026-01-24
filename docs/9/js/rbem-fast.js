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

    // 差し替え前のコードは削除し、以下のコードに置き換えてください

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
      if (rubyContent.trim() === '' && !rubyContent.includes('|')) return match; // rubyContentが空または空白のみの場合

      // ★★★ ここからが新しいアルゴリズム ★★★

      // 1. URLの特定
      const tempParts = rubyContent.split(/\||｜/);
      const url = tempParts.find(p => p.startsWith('http:') || p.startsWith('https:') || p.startsWith('mailto:') || p.startsWith('tel:'));
      
      // 2. ルビ要素の特定
      const rubyParts = tempParts.filter(p => !(p.startsWith('http:') || p.startsWith('https:') || p.startsWith('mailto:') || p.startsWith('tel:')));

      // 3. 構文の有効性チェック
      // チェック1: URLとルビの共存チェック (URLがあり、かつルビ要素が3つ以上は無効)
      if (url && rubyParts.length >= 3) {
          return match;
      }
      // チェック1-2: URLがなく、かつルビ要素が3つ以上は無効
      if (!url && rubyParts.length >= 3) {
          return match;
      }

      // チェック2: 空文字・空白文字チェック
      const isValidDownRuby = rubyParts.length === 2 && rubyParts[0] === '' && rubyParts[1].trim() !== '' && !IS_ONLY_WHITESPACE.test(rubyParts[1]);
      if (!isValidDownRuby) {
        if (rubyParts.some(p => p === '' || IS_ONLY_WHITESPACE.test(p))) {
          return match;
        }
      }

      // ★★★ ここまでが新しいアルゴリズム ★★★

      // 4. HTMLの生成
      const parsedBase = base.replace(/《《([^》]+?)》》/g, `<em class="bouten">$1</em>`);
      
      let rubyHtml = '';
      const hasOver = rubyParts[0] && rubyParts[0].trim() !== '';
      const hasUnder = rubyParts[1] && rubyParts[1].trim() !== '';

      if (hasOver && hasUnder) {
        rubyHtml = `<ruby class="under"><ruby class="over">${parsedBase}<rt>${rubyParts[0]}</rt></ruby><rt aria-hidden="true">${rubyParts[1]}</rt></ruby>`;
      } else if (hasOver) {
        rubyHtml = `<ruby class="over">${parsedBase}<rt>${rubyParts[0]}</rt></ruby>`;
      } else if (hasUnder) { // isDownRubyがtrueのケース
        rubyHtml = `<ruby class="under">${parsedBase}<rt>${rubyParts[1]}</rt></ruby>`;
      }

      let result = rubyHtml || parsedBase;

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
