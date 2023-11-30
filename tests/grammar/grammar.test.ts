import Grammar from '../../src/grammars/grammar';

class TestGrammar extends Grammar {
    // Aquí puedes implementar los métodos abstractos si los hay
}

describe('Grammar', () => {
    let grammar: TestGrammar;

    beforeEach(() => {
        grammar = new TestGrammar();
    });

    it('should create an instance', () => {
        expect(grammar).toBeInstanceOf(Grammar);
    });

    it('should have a unique symbol', () => {
        expect(grammar['@instanceOf']).toBe(Symbol.for('Grammar'));
    });

    it('should return the correct operators', () => {
        const operators = grammar.getOperators();
        expect(operators).toEqual([]); // Asume que no hay operadores por defecto
    });

    // Aquí puedes agregar más pruebas para los métodos de tu clase...
});
