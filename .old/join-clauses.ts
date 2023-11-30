import { Join, JoinClause, JoinNested, JoinSq } from './domain/join.interface';
import { Operators } from './domain/operators';
import Expression from './expression';
import JoinWhereClauses from './join-where-clauses';

export type JoinTableIsString = [string, string, Operators, string, Join];

export type JoinTableIsSubQuery = [JoinSq, string, string, Operators, string, Join];

export default class JoinClauses {
    public clauses: JoinClause[] = [];

    public static create(): JoinClauses {
        return new JoinClauses();
    }

    public join(table: string, first: string, second: string, joinType?: Join): this;
    public join(table: string, first: string, operator: Operators, second: string, joinType?: Join): this;
    public join(table: string, ons: JoinNested, joinType?: Join): this;
    public join(sq: JoinSq, alias: string, first: string, second: string, joinType?: Join): this;
    public join(sq: JoinSq, alias: string, first: string, operator: Operators, second: string, joinType?: Join): this;
    public join(sq: JoinSq, alias: string, ons: JoinNested, joinType?: Join): this;
    public join(...args: unknown[]): this {
        if (typeof args[0] === 'string') {
            const [table, first, operator, second, joinType = 'inner'] = args as JoinTableIsString;

            return this.whenJoinTableIsString(table, first, operator, second, joinType);
        }

        if (typeof args[0] === 'function') {
            const [table, alias, first, operator, second, joinType = 'inner'] = args as JoinTableIsSubQuery;

            return this.whenJoinTableIsSubQuery(table, alias, first, operator, second, joinType);
        }

        return this;
    }

    public leftJoin(table: string, first: string, second: string): this;
    public leftJoin(table: string, first: string, operator: Operators, second: string): this;
    public leftJoin(table: string, wheres: JoinNested): this;
    public leftJoin(sq: JoinSq, alias: string, first: string, second: string): this;
    public leftJoin(sq: JoinSq, alias: string, first: string, operator: Operators, second: string): this;
    public leftJoin(sq: JoinSq, alias: string, wheres: JoinNested): this;
    public leftJoin(...args: unknown[]): this {
        if (typeof args[0] === 'function') {
            const [table, alias, first, operator, second] = args as JoinTableIsSubQuery;
            return this.join(table, alias, first, operator, second, 'left');
        }

        if (typeof args[0] === 'string') {
            const [table, first, operator, second] = args as JoinTableIsString;
            return this.join(table, first, operator, second, 'left');
        }

        return this;
    }

    public rightJoin(table: string, first: string, second: string): this;
    public rightJoin(table: string, first: string, operator: Operators, second: string): this;
    public rightJoin(table: string, wheres: JoinNested): this;
    public rightJoin(sq: JoinSq, alias: string, second: string): this;
    public rightJoin(sq: JoinSq, alias: string, operator: Operators, second: string): this;
    public rightJoin(sq: JoinSq, alias: string, wheres: JoinNested): this;
    public rightJoin(...args: unknown[]): this {
        if (typeof args[0] === 'function') {
            const [table, alias, first, operator, second] = args as JoinTableIsSubQuery;
            return this.join(table, alias, first, operator, second, 'right');
        }

        if (typeof args[0] === 'string') {
            const [table, first, operator, second] = args as JoinTableIsString;
            return this.join(table, first, operator, second, 'right');
        }

        return this;
    }

    public fullOuterJoin(table: string, first: string, second: string): this;
    public fullOuterJoin(table: string, first: string, operator: Operators, second: string): this;
    public fullOuterJoin(table: string, wheres: JoinNested): this;
    public fullOuterJoin(sq: JoinSq, alias: string, second: string): this;
    public fullOuterJoin(sq: JoinSq, alias: string, operator: Operators, second: string): this;
    public fullOuterJoin(sq: JoinSq, alias: string, wheres: JoinNested): this;
    public fullOuterJoin(...args: unknown[]): this {
        if (typeof args[0] === 'function') {
            const [table, alias, first, operator, second] = args as JoinTableIsSubQuery;
            return this.join(table, alias, first, operator, second, 'full');
        }

        if (typeof args[0] === 'string') {
            const [table, first, operator, second] = args as JoinTableIsString;
            return this.join(table, first, operator, second, 'full');
        }

        return this;
    }

    public crossJoin(table: string, alias?: string): this;
    public crossJoin(sq: JoinSq, alias: string): this;
    public crossJoin(...args: unknown[]): this {
        const [table, alias] = args;

        if (typeof table === 'string') {
            this.clauses.push({ join: 'cross', type: 'table', table, alias: alias as string });
            return this;
        }

        if (typeof table === 'function') {
            this.clauses.push({ join: 'cross', type: 'table', query: table as JoinSq, alias: alias as string });
        }

        return this;
    }

    private whenJoinTableIsSubQuery(
        sq: JoinSq,
        alias: string,
        first: string | Expression,
        operator: Operators | unknown,
        second: unknown,
        join: Join,
    ): this {
        const bindings = [];

        if (operator instanceof JoinWhereClauses) {
            this.clauses.push({
                join,
                type: 'subNested',
                query: sq,
                alias,
                nested: operator.clauses,
            });

            return this;
        }

        if (second === undefined) {
            this.clauses.push({
                join,
                type: 'sub',
                query: sq,
                alias,
                first: first as string,
                operator: '=',
                second: operator as string,
            });

            return this;
        }

        if (second instanceof Expression) {
            bindings.push(...second.bindings);
        }

        this.clauses.push({
            join,
            type: 'sub',
            query: sq,
            alias,
            first: first as string,
            operator,
            second: second as string,
        });

        return this;
    }

    private whenJoinTableIsString(
        table: string,
        first: unknown,
        operator: unknown | Operators,
        second: unknown,
        joinType?: Join,
    ): this {
        const bindings = [];

        if (typeof first === 'function') {
            const nested = new JoinWhereClauses();
            first(nested);
            this.clauses.push({ join: joinType, type: 'nested', table, nested: nested.clauses });

            return this;
        }

        if (first instanceof Expression) {
            bindings.push(...first.bindings);
        }

        if (second === undefined) {
            if (operator instanceof Expression) {
                bindings.push(...operator.bindings);
            }

            this.clauses.push({
                join: joinType,
                type: 'basic',
                table,
                operator: '=',
                first: first as string,
                second: operator as string,
            });

            return this;
        }

        if (second instanceof Expression) {
            bindings.push(...second.bindings);
        }

        this.clauses.push({
            join: joinType,
            type: 'basic',
            table,
            operator: operator as Operators,
            first: first as string,
            second: second as string,
        });

        return this;
    }
}
