import { BlockRule } from '../core/rule.js';

/**
 * 改ページ（Page Break）の解析ルールクラス。
 * 10個以上のイコール（=）のみで構成される行にマッチします。
 */
export class PageBreakRule extends BlockRule {
    constructor() {
        /**
         * 正規表現の解説:
         * ^={10,}$ : 行頭から行末までイコールが10個以上連続する行
         */
        super('page-break', /^={10,}$/);
    }
}

