import DriverNotSupportedError from './common/errors/driver-not-supported.error';
import MssqlGrammar from './grammars/mssql.grammar';
import MysqlGrammar from './grammars/mysql.grammar';
import PostgresGrammar from './grammars/postgres/postgres.grammar';
import SqliteGrammar from './grammars/sqlite.grammar';

const driverMap = {
    mysql: new MysqlGrammar(),
    postgres: new PostgresGrammar(),
    sqlite: new SqliteGrammar(),
    mssql: new MssqlGrammar(),
} as const;

type DriverMap = typeof driverMap;

export default class GrammarFactory {
    readonly '@instanceof' = Symbol.for('GrammarFactory');

    static create<T extends keyof DriverMap>(driver: T): DriverMap[T] {
        if (driver in driverMap) {
            return driverMap[driver];
        }

        throw new DriverNotSupportedError(driver);
    }
}
