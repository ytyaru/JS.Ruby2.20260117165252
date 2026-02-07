import { BlockRule } from '../core/rule.js';

export class ThematicBreakRule extends BlockRule {
    constructor() {
        // =が5個以上、9個以下
        // 10個以上は PageBreakRule が担当するため、ここではマッチさせない
        super('thematic-break', /^={5,9}$/);
    }
}

