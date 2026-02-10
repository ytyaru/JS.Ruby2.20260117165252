import { BlockRule } from '../core/rule.js';

/**
 * 主題区切り（Thematic Break）の解析ルールクラス。
 * 5個以上9個以下のイコール（=）のみで構成される行にマッチします。
 * 10個以上のイコールは PageBreakRule が担当するため、ここでは除外します。
 */
export class ThematicBreakRule extends BlockRule {
    constructor() {
        /**
         * 正規表現の解説:
         * ^={5,9}$ : 行頭から行末までイコールが5個から9個連続する行
         */
        super('thematic-break', /^={5,9}$/);
    }
}

