import { CharGroup } from "./char-group.js";
import { CharGroupLarge } from "./char-group-large.js";

export class CharGroupMerger {
    /**
     * 各クラスから範囲データ [[start, end], ...] を抽出する内部メソッド
     */
    static #toRanges(group) {
        // CharGroupLarge は内部で #ranges を持っていますが、
        // 外部からアクセスするために items 経由で変換するか、
        // あるいは Large 側だけに getter を置くのが安全です。
        // ここでは共通して扱える items (または source の再現) を想定します。
        
        // Large インスタンスに ranges ゲッターがない場合を想定した汎用的な変換
        const cps = group.items.map(char => char.codePointAt(0)).sort((a, b) => a - b);
        const res = [];
        if (cps.length === 0) return res;

        let start = cps[0], end = cps[0];
        for (let i = 1; i < cps.length; i++) {
            if (cps[i] === end + 1) {
                end = cps[i];
            } else {
                res.push([start, end]);
                start = end = cps[i];
            }
        }
        res.push([start, end]);
        return res;
    }

    /**
     * 複数のグループをマージして新しい CharGroupLarge を生成
     */
    static merge(groups, label = { ja: '結合グループ', en: 'MergedGroup' }) {
        if (!Array.isArray(groups)) {
            groups = [groups];
        }

        const allRanges = [];

        for (const g of groups) {
            // インスタンスチェックと詳細なエラーメッセージ
            const isCharGroup = g instanceof CharGroup;
            const isCharGroupLarge = g instanceof CharGroupLarge;

            if (!isCharGroup && !isCharGroupLarge) {
                const actualType = g?.constructor?.name || typeof g;
                throw new TypeError(
                    `配列要素の型が違います。配列groupsの要素はCharGroupかCharGroupLargeインスタンスであるべきです。: ${actualType}`
                );
            }

            // 範囲データを抽出して集積
            allRanges.push(...this.#toRanges(g));
        }

        // 最終的に Large クラスに集約して返す
        return new CharGroupLarge(allRanges, label);
    }
}

