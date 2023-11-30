import Grammar from './grammar';

export default class MysqlGrammar extends Grammar {
    readonly '@instanceOf' = Symbol.for('MysqlGrammar');
}
