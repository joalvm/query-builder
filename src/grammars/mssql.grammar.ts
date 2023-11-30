import Grammar from './grammar';

export default class MssqlGrammar extends Grammar {
    readonly '@instanceOf' = Symbol.for('MssqlGrammar');
}
