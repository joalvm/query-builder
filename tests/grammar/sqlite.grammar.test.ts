// Generated by CodiumAI

import Grammar from '../../src/grammars/grammar';
import SqliteGrammar from '../../src/grammars/sqlite.grammar';

describe('SqliteGrammar', () => {
    // sqliteGrammar extends Grammar
    it('should extend Grammar', () => {
        const sqliteGrammar = new SqliteGrammar();
        expect(sqliteGrammar instanceof Grammar).toBe(true);
    });

    // Should have a '@instanceOf' property with a unique symbol
    it("should have a '@instanceOf' property with a unique symbol", () => {
        const sqliteGrammar = new SqliteGrammar();
        expect(sqliteGrammar['@instanceOf']).toBe(Symbol.for('SqliteGrammar'));
    });
});
