import { Operators } from './domain/operators';
import WhereClause, { WhereBoolean, WhereNested, WhereSq, WhereValue } from './domain/where.interface';

export default class WhereClauses {
    public clauses: WhereClause[] = [];

    public static create(): WhereClauses {
        return new WhereClauses();
    }

    public where(column: string, value: unknown, boolean?: WhereBoolean): this;
    public where(column: string, operator: Operators, value: unknown, boolean?: WhereBoolean): this;
    public where(columns: Record<string, unknown>, boolean?: WhereBoolean): this;
    public where(columns: [string, Operators, unknown][], boolean?: WhereBoolean): this;
    public where(nested: WhereNested, boolean?: WhereBoolean): this;
    public where(column: string, sq: WhereSq, boolean?: WhereBoolean): this;
    public where(column: string, operator: Operators, sq: WhereSq, boolean?: WhereBoolean): this;
    public where(...args: unknown[]): this {
        const [column, operator, value, boolean = 'and'] = args;

        if (typeof column === 'string') {
            this.whenWhereColumnIsString(column, operator as Operators, value, boolean as WhereBoolean);
        }

        if (typeof column === 'object') {
            this.whenWhereColumnIsObject(column as Record<string, unknown>, boolean as WhereBoolean);
        }

        if (Array.isArray(column)) {
            this.whenWhereColumnIsArray(column as [string, Operators, unknown][], boolean as WhereBoolean);
        }

        if (typeof column === 'function') {
            this.whenWhereColumnIsFunction(column as WhereNested, boolean as WhereBoolean);
        }

        return this;
    }

    public orWhere(column: string, value: unknown): this;
    public orWhere(column: string, operator: Operators, value: unknown): this;
    public orWhere(columns: Record<string, unknown>): this;
    public orWhere(columns: [string, Operators, unknown][]): this;
    public orWhere(nested: WhereNested): this;
    public orWhere(column: string, sq: WhereSq): this;
    public orWhere(column: string, operator: Operators, sq: WhereSq): this;
    public orWhere(...args: unknown[]): this {
        const [column, operator, value] = args;
        return this.where(column as string, operator as Operators, value, 'or');
    }

    public whereNotIn(column: string, values: unknown[], boolean: WhereBoolean = 'and'): this {
        return this.whereIn(column, values, boolean, true);
    }

    public orWhereNotIn(column: string, values: unknown[]): this {
        return this.whereNotIn(column, values, 'or');
    }

    public whereNull(column: string | string[], boolean: WhereBoolean = 'and', not = false): this {
        const type = not ? 'notNull' : 'null';
        if (Array.isArray(column)) {
            for (const col of column) {
                this.clauses.push({ column: col, boolean, type, operator: 'is' });
            }
            return this;
        }

        this.clauses.push({ column, boolean, type, operator: 'is' });

        return this;
    }

    public orWhereNull(column: string[]): this;
    public orWhereNull(column: string): this;
    public orWhereNull(...args: [string | string[]]): this {
        return this.whereNull(...args, 'or');
    }

    public whereNotNull(column: string | string[], boolean: WhereBoolean = 'and'): this {
        return this.whereNull(column, boolean, true);
    }

    public orWhereNotNull(column: string | string[]): this {
        return this.whereNotNull(column, 'or');
    }

    public whereBetween(column: string, values: unknown[], boolean: WhereBoolean = 'and', not = false): this {
        const type = not ? 'notBetween' : 'between';
        this.clauses.push({ column, value: values, boolean, type });
        return this;
    }

    public orWhereBetween(column: string, values: unknown[]): this {
        return this.whereBetween(column, values, 'or');
    }

    public whereNotBetween(column: string, values: unknown[], boolean: WhereBoolean = 'and'): this {
        return this.whereBetween(column, values, boolean, true);
    }

    public orWhereNotBetween(column: string, values: unknown[]): this {
        return this.whereNotBetween(column, values, 'or');
    }

    public whereExists(sq: WhereSq, boolean: WhereBoolean = 'and', not = false): this {
        const type = not ? 'notExists' : 'exists';

        this.clauses.push({ boolean, type, query: sq });
        return this;
    }

    public orWhereExists(callback: WhereSq): this {
        return this.whereExists(callback, 'or');
    }

    public whereNotExists(callback: WhereSq, boolean: WhereBoolean = 'and'): this {
        return this.whereExists(callback, boolean, true);
    }

    public orWhereNotExists(callback: WhereSq): this {
        return this.whereNotExists(callback, 'or');
    }

    public whereRaw(expression: string, bindings?: unknown[], boolean: WhereBoolean = 'and'): this {
        this.clauses.push({ boolean, type: 'raw', expression, bindings });
        return this;
    }

    public orWhereRaw(sql: string, bindings?: unknown[]): this {
        return this.whereRaw(sql, bindings, 'or');
    }

    private whenWhereColumnIsString(column: string, operator: unknown, value: unknown, boolean: WhereBoolean): this {
        if (value === undefined) {
            // Cuando el valor es undefined, se asume que el operador es el valor y el operador es =
            if (typeof operator === 'function') {
                this.clauses.push({
                    type: 'sub',
                    column,
                    operator: '=',
                    boolean,
                    query: operator as WhereSq,
                });

                return this;
            }

            this.clauses.push({
                column,
                operator: '=',
                value: operator,
                boolean,
                type: 'basic',
            });

            return this;
        }

        if (typeof value === 'function') {
            this.clauses.push({
                type: 'sub',
                boolean,
                operator: operator as Operators,
                query: value as WhereSq,
            });

            return this;
        }

        this.clauses.push({
            column,
            operator: operator as Operators,
            value: value as WhereValue,
            boolean,
            type: 'basic',
        });

        return this;
    }

    private whenWhereColumnIsObject(columns: Record<string, unknown>, boolean: WhereBoolean): void {
        const wheres = WhereClauses.create();

        for (const [col, value] of Object.entries(columns)) {
            wheres.where(col, '=', value, boolean);
        }

        this.clauses.push({ nested: wheres, boolean, type: 'nested' });
    }

    private whenWhereColumnIsArray(columns: [string, Operators, unknown][], boolean: WhereBoolean): void {
        const wheres = WhereClauses.create();

        for (const [col, operator, value] of columns) {
            wheres.where(col, operator, value, boolean);
        }

        this.clauses.push({ nested: wheres, boolean, type: 'nested' });
    }

    private whenWhereColumnIsFunction(nested: WhereNested, boolean: WhereBoolean): void {
        const wheres = WhereClauses.create();
        nested(wheres);
        this.clauses.push({ nested: wheres, boolean, type: 'nested' });
    }

    public whereIn(column: string, values: unknown[], boolean: WhereBoolean = 'and', not = false): this {
        const type = not ? 'notIn' : 'in';
        this.clauses.push({ column, value: values, boolean, type });
        return this;
    }
}
