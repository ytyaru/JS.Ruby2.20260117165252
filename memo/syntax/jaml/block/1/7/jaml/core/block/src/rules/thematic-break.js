import { BlockRule } from '../core/rule.js';

export class ThematicBreakRule extends BlockRule {
    constructor() {
        // =が5個以上
        super('thematic-break', /^={5,}$/);
    }
}
