import Grammar from './grammar';

export default class SqliteGrammar extends Grammar {
    readonly '@instanceOf' = Symbol.for('SqliteGrammar');
}
