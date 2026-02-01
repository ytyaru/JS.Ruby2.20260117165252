// jaml.js
import { Blot } from './blot.js';
import { BlockParser } from './block-parser.js';
import { Pager } from './pager.js';

export class Jaml {
    constructor() {
        this.parser = new BlockParser();
    }

    parse(manuscript) {
        const blot = new Blot(manuscript);
        const pager = new Pager();

        for (const block of blot.lex()) {
            this.parser.parse(block, blot.manuscript);
            pager.add(block);
        }

        return pager.items.map(p => p.html).join('\n');
    }

    async parseAsync(manuscript) {
        const blot = new Blot(manuscript);
        const pager = new Pager();

        for await (const block of blot.lexAsync()) {
            this.parser.parse(block, blot.manuscript);
            pager.add(block);
        }

        return pager.items.map(p => p.html).join('\n');
    }
}
