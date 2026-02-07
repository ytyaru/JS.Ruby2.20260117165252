import { BlockRule } from '../core/rule.js';

export class PageBreakRule extends BlockRule {
    constructor() {
        // =が10個以上
        super('page-break', /^={10,}$/);
    }
}
