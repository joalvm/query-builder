import Grammar from '../grammar';

class PostgresGrammar extends Grammar {
    readonly '@instanceOf' = Symbol.for('PostgresGrammar');
}

export default PostgresGrammar;
