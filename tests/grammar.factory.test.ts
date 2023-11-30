import { Drivers } from '../src/common/drivers';
import DriverNotSupportedError from '../src/common/errors/driver-not-supported.error';
import GrammarFactory from '../src/grammar.factory';
import MysqlGrammar from '../src/grammars/mysql.grammar';

describe('GrammarFactory', () => {
    // Should return the correct grammar instance for a valid driver
    it('should return the correct grammar instance for a valid driver', () => {
        const grammar = GrammarFactory.create('mysql');
        expect(grammar).toBeInstanceOf(MysqlGrammar);
    });

    // Should return the same instance for multiple calls with the same driver
    it('should return the same instance for multiple calls with the same driver', () => {
        const grammar1 = GrammarFactory.create('mysql');
        const grammar2 = GrammarFactory.create('mysql');
        expect(grammar1).toBe(grammar2);
    });

    // Should have a '@instanceof' property with a unique symbol
    it("should have a '@instanceof' property with a unique symbol", () => {
        const factory = new GrammarFactory();
        expect(factory['@instanceof']).toBe(Symbol.for('GrammarFactory'));
    });

    // Should throw a DriverNotSupportedError for an invalid driver
    it('should throw a DriverNotSupportedError for an invalid driver', () => {
        expect(() => {
            GrammarFactory.create('invalid' as Drivers);
        }).toThrow(DriverNotSupportedError);
    });

    // Should throw a DriverNotSupportedError for a driver with an invalid type
    it('should throw a DriverNotSupportedError for a driver with an invalid type', () => {
        expect(() => {
            GrammarFactory.create(123 as unknown as Drivers);
        }).toThrow(DriverNotSupportedError);
    });

    // Should throw a DriverNotSupportedError for a driver with a null value
    it('should throw a DriverNotSupportedError for a driver with a null value', () => {
        expect(() => {
            GrammarFactory.create(null as unknown as Drivers);
        }).toThrow(DriverNotSupportedError);
    });
});
