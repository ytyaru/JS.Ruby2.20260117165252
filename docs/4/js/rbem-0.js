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
    // パターン1: 強調のみ 《《...》》
    // パターン2: ルビ/リンク付き [｜]親文字《...》
    const regex = /《《([^》]*?)》》|(｜)?((?:《《[^》]+?》》|[^｜《\n])+?)《([^》]*)》/g;

    processedText = processedText.replace(regex, (
      match,
      emphasis,      // $1: パターン1 (強調) の内容
      pipe,          // $2: パターン2 の先頭パイプ `｜`
      base,          // $3: パターン2 の親文字
      rubyContent    // $4: パターン2 のルビカッコ《》の中身
    ) => {

      // --- パターン1: 強調のみ 《《...》》 ---
      if (emphasis !== undefined) {
        // 《《》》のように中身が空か空白文字のみの場合は変換しない
        if (emphasis.trim() === '') return match;
        return `<em class="bouten">${emphasis}</em>`;
      }

      // --- パターン2: ルビ/リンク [｜]親文字《...》 ---
      // ルビカッコ《》の中身が空か空白文字のみの場合は変換しない
      if (rubyContent.trim() === '') {
        return match;
      }

      // 親文字に含まれる強調《《...》》を先にemタグへ変換
      const parsedBase = base.replace(/《《([^》]*?)》》/g, '<em class="bouten">$1</em>');

      // ルビカッコ《》の中身を'|'で分割して解析
      const parts = rubyContent.split('|');
      const url = parts.find(p => p.startsWith('http://') || p.startsWith('https://'));
      const rubyParts = parts.filter(p => !(p.startsWith('http://') || p.startsWith('https://')));

      let overRuby = '';
      let underRuby = '';

      // rubyPartsの要素に基づいて上下ルビを割り当てる
      // 例: 《うえ｜した》 -> rubyParts=['うえ', 'した']
      // 例: 《｜した》 -> rubyParts=['', 'した']
      // 例: 《うえ｜》 -> rubyParts=['うえ', '']
      if (rubyParts.length > 0) {
        overRuby = rubyParts[0];
      }
      if (rubyParts.length > 1) {
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

