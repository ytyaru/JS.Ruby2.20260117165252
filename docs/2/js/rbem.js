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

    // エスケープされた文字を一時的な一意のプレースホルダーに置き換える
    const placeholders = {
      escL: `%%ESC_L_${Date.now()}%%`,
      escR: `%%ESC_R_${Date.now()}%%`,
      escP: `%%ESC_P_${Date.now()}%%`,
    };
    let processedText = text
      .replace(/\\《/g, placeholders.escL)
      .replace(/\\》/g, placeholders.escR)
      .replace(/\\｜/g, placeholders.escP);

    // メインの置換処理を行う正規表現
    // 優先度が高い複雑なパターン（ルビ/リンク）を先に評価する
    // パターン1: [｜]親文字《...》 (ルビ/リンク)
    // パターン2: 《《...》》 (強調のみ)
    const regex = /(｜)?((?:《《[^》]+?》》|[^｜《\n])+?)《([^》]*)》|《《([^》\n]*?)》》/g;

    processedText = processedText.replace(regex, (
      match,
      // パターン1 のキャプチャグループ
      pipe,          // $1: 先頭パイプ `｜`
      base,          // $2: 親文字
      rubyContent,   // $3: ルビカッコ《》の中身
      // パターン2 のキャプチャグループ
      emphasis       // $4: 強調《《》》の中身
    ) => {

      // --- パターン2: 強調のみ 《《...》》 ---
      if (emphasis !== undefined) {
        if (emphasis.trim() === '') return '《《》》'; // 空の場合は変換せずそのまま
        return `<em class="bouten">${emphasis}</em>`;
      }

      // --- パターン1: ルビ/リンク [｜]親文字《...》 ---

      // \《...》 のようにエスケープされたものが誤爆した場合の対処
      if (base === placeholders.escL) {
        return `《${rubyContent}》`;
      }
      
      // ルビカッコ《》の中身が空か空白文字のみの場合は変換しない
      if (rubyContent.trim() === '') {
        return match;
      }

      // 親文字に含まれる強調《《...》》を先にemタグへ変換
      const parsedBase = base.replace(/《《([^》\n]*?)》》/g, (m, em) => 
        em.trim() === '' ? '《《》》' : `<em class="bouten">${em}</em>`
      );

      // ルビカッコ《》の中身を全角・半角パイプで分割して解析
      const parts = rubyContent.split(/\||｜/);
      const url = parts.find(p => p.startsWith('http://') || p.startsWith('https://'));
      const rubyParts = parts.filter(p => !(p.startsWith('http://') || p.startsWith('https://')));

      let overRuby = '';
      let underRuby = '';

      // rubyPartsの要素に基づいて上下ルビを割り当てる
      if (rubyParts.length === 1) {
        // 《うえ》 or 《｜》 or 《》
        overRuby = rubyParts[0];
      } else if (rubyParts.length >= 2) {
        // 《｜した》 or 《うえ｜》 or 《うえ｜した》
        overRuby = rubyParts[0];
        underRuby = rubyParts[1];
      }

      // HTMLを構築
      let result = parsedBase;
      const hasOver = overRuby && overRuby.trim() !== '';
      const hasUnder = underRuby && underRuby.trim() !== '';

      if (hasOver && hasUnder) {
        // 上下ルビ
        result = `<ruby class="under"><ruby class="over">${parsedBase}<rt>${overRuby}</rt></ruby><rt aria-hidden="true">${underRuby}</rt></ruby>`;
      } else if (hasOver) {
        // 上ルビのみ
        result = `<ruby class="over">${parsedBase}<rt>${overRuby}</rt></ruby>`;
      } else if (hasUnder) {
        // 下ルビのみ
        result = `<ruby class="under">${parsedBase}<rt>${underRuby}</rt></ruby>`;
      }

      // URLがあれば全体をaタグで囲む
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

