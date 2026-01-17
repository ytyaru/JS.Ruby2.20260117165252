class RbEm {
  /**
   * 指定されたテキストを解析し、HTML文字列に変換します。
   * @param {string} text - 変換対象の元原稿テキスト。
   * @returns {string} 変換後のHTML文字列。
   */
  static parse(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return '';
    }

    // エスケープ処理
    const placeholders = {
      escL: `%%ESC_L_${Date.now()}%%`,
      escR: `%%ESC_R_${Date.now()}%%`,
      escP: `%%ESC_P_${Date.now()}%%`,
    };
    let processedText = text
      .replace(/\\《/g, placeholders.escL)
      .replace(/\\》/g, placeholders.escR)
      .replace(/\\｜/g, placeholders.escP);

    // 優先順位を考慮した正規表現
    const regex = new RegExp([
      // 1. パイプ付与形: ｜親文字《ルビ》 (最優先)
      // 親文字には《《強調》》が含まれることを許容
      `(｜)((?:《《[^》]+?》》|[^《\\n])+?)《([^》]*)》`,

      // 2. 強調＋ルビ形: 《《強調》》《ルビ》
      `(《《[^》]+?》》)《([^》]*)》`,

      // 3. パイプ省略形: 漢字《ルビ》
      // 親文字は漢字のみ。直後に《が続くパターン(強調)は除外
      `([一-龠々]+)《(?!《)([^》]*)》`,

      // 4. 強調のみ: 《《強調》》 (最低優先)
      `《《([^》\\n]*?)》》`
    ].join('|'), 'g');

    processedText = processedText.replace(regex, (
      match,
      // パターン1 のキャプチャ
      pipe, pipeBase, pipeRuby,
      // パターン2 のキャプチャ
      emBase, emRuby,
      // パターン3 のキャプチャ
      shortBase, shortRuby,
      // パターン4 のキャプチャ
      emphasis
    ) => {

      // --- パターン4: 強調のみ ---
      if (emphasis !== undefined) {
        if (emphasis.trim() === '') return '《《》》';
        return `<em class="bouten">${emphasis}</em>`;
      }

      // --- ルビを持つパターン (1, 2, 3) ---
      const base = pipeBase || emBase || shortBase;
      const rubyContent = pipeRuby || emRuby || shortRuby;

      // rubyContentがundefinedになることはないはずだが、エラー回避のためチェック
      if (rubyContent === undefined) return match;
      
      if (rubyContent.trim() === '') {
        return match;
      }

      // 親文字に含まれる《《強調》》をemタグへ変換
      const parsedBase = base.replace(/《《([^》\n]*?)》》/g, (m, em) =>
        em.trim() === '' ? '《《》》' : `<em class="bouten">${em}</em>`
      );

      // ルビの中身を解析
      const parts = rubyContent.split(/\||｜/);
      const url = parts.find(p => p.startsWith('http://') || p.startsWith('https://'));
      const rubyParts = parts.filter(p => !(p.startsWith('http://') || p.startsWith('https://')));

      let overRuby = '';
      let underRuby = '';

      if (rubyParts.length === 1) {
        overRuby = rubyParts[0];
      } else if (rubyParts.length >= 2) {
        overRuby = rubyParts[0];
        underRuby = rubyParts[1];
      }

      // HTMLを構築
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
    processedText = processedText
      .replace(new RegExp(placeholders.escL, 'g'), '《')
      .replace(new RegExp(placeholders.escR, 'g'), '》')
      .replace(new RegExp(placeholders.escP, 'g'), '｜');

    return processedText;
  }
}

