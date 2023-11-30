import SqlCompiler from './compiler';
import ClauseKeys from './domain/clause-keys.enum';
import Clauses from './domain/clauses.interface';
import { FromSq } from './domain/from.interface';
import { GroupBySq } from './domain/group-by.interface';
import { JoinNested, JoinSq } from './domain/join.interface';
import { Operators } from './domain/operators';
import OrderByClause, { OrderByDirection } from './domain/order-by';
import { SelectSq } from './domain/select.clause';
import { WhereBoolean, WhereNested, WhereSq } from './domain/where.interface';
import Expression from './expression';
import JoinClauses from './join-clauses';
import WhereClauses from './where-clauses';

export default class Builder {
    clauses: Clauses = {
        [ClauseKeys.DISTINCT]: false,
        [ClauseKeys.SELECT]: {
            distinct: false,
            columns: [],
        },
        [ClauseKeys.FROM]: [],
        [ClauseKeys.JOIN]: [],
        [ClauseKeys.WHERE]: [],
        [ClauseKeys.GROUP_BY]: [],
        [ClauseKeys.HAVING]: [],
        [ClauseKeys.ORDER_BY]: [],
        [ClauseKeys.UNION]: [],
        [ClauseKeys.UNION_ORDER]: [],
        [ClauseKeys.LIMIT]: undefined,
        [ClauseKeys.OFFSET]: undefined,
    };

    public static factory(): Builder {
        return new Builder();
    }

    public newQuery(): Builder {
        return new Builder();
    }

    public distinct(): this;
    public distinct(columns: string[]): this;
    public distinct(raw: Expression): this;
    public distinct(...args: unknown[]): this {
        if (args.length === 0) {
            this.clauses.distinct = true;

            return this;
        }

        if (args.length === 1) {
            this.clauses.distinct = args[0] as string[] | Expression;
        }

        return this;
    }

    public select(sq: SelectSq, alias: string): this;
    public select(columns: (string | Expression)[]): this;
    public select(...columns: (string | Expression)[]): this;
    public select(...args: unknown[]): Builder {
        if (args.length === 2 && typeof args[0] === 'function') {
            this.clauses.select.columns.push({
                type: 'subquery',
                query: args[0] as SelectSq,
                alias: args[1] as string,
            });

            return this;
        }

        args.flat(2).forEach((column) => {
            if (column instanceof Expression) {
                this.clauses.select.columns.push({
                    type: 'expression',
                    value: column,
                    alias: undefined,
                });

                return;
            }

            this.clauses.select.columns.push({
                type: 'column',
                value: column as string,
                alias: undefined,
            });
        });

        return this;
    }

    public selectRaw(sql: string, bindings?: unknown[]): Builder {
        this.clauses.select.columns.push({
            type: 'expression',
            value: new Expression(sql, bindings),
            alias: undefined,
        });

        return this;
    }

    public from(table: string | Expression): this;
    public from(sq: FromSq, alias: string): this;
    public from(table: string | Expression, alias: string): this;
    public from(...args: unknown[]): this {
        if (args.length === 2 && typeof args[0] === 'function') {
            this.clauses.from.push({
                type: 'subquery',
                query: args[0] as FromSq,
                alias: args[1] as string,
            });

            return this;
        }

        this.clauses.from.push({
            type: 'basic',
            table: args[0] as string,
            alias: (args[1] || undefined) as string,
        });

        return this;
    }

    public join(table: string, first: string, second: string): this;
    public join(table: string, first: string, operator: Operators, second: string): this;
    public join(table: string, wheres: JoinNested): this;
    public join(sq: JoinSq, alias: string, first: string, second: string): this;
    public join(sq: JoinSq, alias: string, first: string, operator: Operators, second: string): this;
    public join(sq: JoinSq, alias: string, wheres: JoinNested): this;
    public join(...args: unknown[]): this {
        const [table, alias, first, operator, second] = args as [JoinSq, string, string, Operators, string];

        this.clauses.join.push(...JoinClauses.create().join(table, alias, first, operator, second).clauses);

        return this;
    }

    public leftJoin(table: string, first: string, second: string): this;
    public leftJoin(table: string, first: string, operator: Operators, second: string): this;
    public leftJoin(table: string, wheres: JoinNested): this;
    public leftJoin(sq: JoinSq, alias: string, first: string, second: string): this;
    public leftJoin(sq: JoinSq, alias: string, first: string, operator: Operators, second: string): this;
    public leftJoin(sq: JoinSq, alias: string, wheres: JoinNested): this;
    public leftJoin(...args: unknown[]): this {
        const [table, alias, first, operator, second] = args as [JoinSq, string, string, Operators, string];

        this.clauses.join.push(...JoinClauses.create().leftJoin(table, alias, first, operator, second).clauses);

        return this;
    }

    public rightJoin(table: string, first: string, second: string): this;
    public rightJoin(table: string, first: string, operator: Operators, second: string): this;
    public rightJoin(table: string, wheres: JoinNested): this;
    public rightJoin(sq: JoinSq, alias: string, second: string): this;
    public rightJoin(sq: JoinSq, alias: string, operator: Operators, second: string): this;
    public rightJoin(sq: JoinSq, alias: string, wheres: JoinNested): this;
    public rightJoin(...args: unknown[]): this {
        const [table, first, operator, second] = args as [string, string, Operators, string];

        this.clauses.join.push(...JoinClauses.create().rightJoin(table, first, operator, second).clauses);

        return this;
    }

    public fullOuterJoin(table: string, first: string, second: string): this;
    public fullOuterJoin(table: string, first: string, operator: Operators, second: string): this;
    public fullOuterJoin(table: string, wheres: JoinNested): this;
    public fullOuterJoin(sq: JoinSq, alias: string, second: string): this;
    public fullOuterJoin(sq: JoinSq, alias: string, operator: Operators, second: string): this;
    public fullOuterJoin(sq: JoinSq, alias: string, wheres: JoinNested): this;
    public fullOuterJoin(...args: unknown[]): this {
        const [table, first, operator, second] = args as [string, string, Operators, string];

        this.clauses.join.push(...JoinClauses.create().fullOuterJoin(table, first, operator, second).clauses);

        return this;
    }

    public crossJoin(table: string, alias?: string): this;
    public crossJoin(sq: JoinSq, alias: string): this;
    public crossJoin(...args: unknown[]): this {
        const [table, alias] = args as [string, string | undefined];

        this.clauses.join.push(...JoinClauses.create().crossJoin(table, alias).clauses);

        return this;
    }

    public where(column: string, value: unknown, boolean?: WhereBoolean): this;
    public where(column: string, operator: Operators, value: unknown, boolean?: WhereBoolean): this;
    public where(columns: Record<string, unknown>, boolean?: WhereBoolean): this;
    public where(columns: [string, Operators, unknown][], boolean?: WhereBoolean): this;
    public where(nested: WhereNested, boolean?: WhereBoolean): this;
    public where(column: string, sq: WhereSq, boolean?: WhereBoolean): this;
    public where(column: string, operator: Operators, sq: WhereSq, boolean?: WhereBoolean): this;
    public where(...args: unknown[]): Builder {
        const [column, operator, value, boolean = 'and'] = args as [string, Operators, unknown, WhereBoolean];

        this.clauses.where.push(...WhereClauses.create().where(column, operator, value, boolean).clauses);

        return this;
    }

    public whereIn(column: string, values: unknown[]): this;
    public whereIn(column: string, values: unknown[], boolean?: WhereBoolean, not?: boolean): this;
    public whereIn(...args: unknown[]): this {
        const [column, values, boolean = 'and', not = false] = args as [string, unknown[], WhereBoolean, boolean];
        this.clauses.where.push(...WhereClauses.create().whereIn(column, values, boolean, not).clauses);
        return this;
    }

    public orWhere(column: string, value: unknown): this;
    public orWhere(column: string, operator: Operators, value: unknown): this;
    public orWhere(columns: Record<string, unknown>): this;
    public orWhere(columns: [string, Operators, unknown][]): this;
    public orWhere(nested: WhereNested): this;
    public orWhere(column: string, sq: WhereSq): this;
    public orWhere(column: string, operator: Operators, sq: WhereSq): this;
    public orWhere(...args: unknown[]): Builder {
        const [column, operator, value] = args as [string, Operators, unknown];
        return this.where(column, operator, value, 'or');
    }

    public whereNotIn(column: string, values: unknown[]): this;
    public whereNotIn(column: string, values: unknown[], boolean?: WhereBoolean): this;
    public whereNotIn(...args: unknown[]): this {
        const [column, values, boolean = 'and'] = args as [string, unknown[], WhereBoolean];
        return this.whereIn(column, values, boolean, true);
    }

    public orWhereNotIn(column: string, values: unknown[]): this {
        return this.whereNotIn(column, values, 'or');
    }

    public whereNull(column: string): this;
    public whereNull(columns: string[], boolean?: WhereBoolean, not?: boolean): this;
    public whereNull(...args: unknown[]): this {
        const [column, boolean = 'and', not = false] = args as [string | string[], WhereBoolean, boolean];
        this.clauses.where.push(...WhereClauses.create().whereNull(column, boolean, not).clauses);

        return this;
    }

    public orWhereNull(column: string): this;
    public orWhereNull(columns: string[]): this;
    public orWhereNull(...args: unknown[]): this {
        const [columns] = args as [string[], boolean];
        return this.whereNull(columns, 'or');
    }

    public whereNotNull(column: string): this;
    public whereNotNull(columns: string[], boolean?: WhereBoolean): this;
    public whereNotNull(...args: unknown[]): this {
        const [column, boolean = 'and'] = args as [string[], WhereBoolean];
        return this.whereNull(column, boolean, true);
    }

    public orWhereNotNull(column: string): this;
    public orWhereNotNull(columns: string[]): this;
    public orWhereNotNull(...args: unknown[]): this {
        const [column] = args as [string[]];
        return this.whereNotNull(column, 'or');
    }

    public whereBetween(
        column: string,
        values: [unknown, unknown],
        boolean: WhereBoolean = 'and',
        not = false,
    ): Builder {
        this.clauses.where.push(...WhereClauses.create().whereBetween(column, values, boolean, not).clauses);
        return this;
    }

    public orWhereBetween(column: string, values: [unknown, unknown]): Builder {
        return this.whereBetween(column, values, 'or');
    }

    public whereNotBetween(column: string, values: [unknown, unknown], boolean: WhereBoolean = 'and'): Builder {
        return this.whereBetween(column, values, boolean, true);
    }

    public orWhereNotBetween(column: string, values: [unknown, unknown]): Builder {
        return this.whereNotBetween(column, values, 'or');
    }

    public whereExists(sq: WhereSq, boolean: WhereBoolean = 'and', not = false): Builder {
        this.clauses.where.push(...WhereClauses.create().whereExists(sq, boolean, not).clauses);
        return this;
    }

    public orWhereExists(sq: WhereSq): Builder {
        return this.whereExists(sq, 'or');
    }

    public whereNotExists(sq: WhereSq, boolean: WhereBoolean = 'and'): Builder {
        return this.whereExists(sq, boolean, true);
    }

    public orWhereNotExists(sq: WhereSq): Builder {
        return this.whereNotExists(sq, 'or');
    }

    public whereRaw(sql: string, bindings?: unknown[], boolean: WhereBoolean = 'and'): Builder {
        this.clauses.where.push(...WhereClauses.create().whereRaw(sql, bindings, boolean).clauses);
        return this;
    }

    public orWhereRaw(sql: string, bindings?: unknown[]): Builder {
        return this.whereRaw(sql, bindings, 'or');
    }

    public groupBy(column: string): this;
    public groupBy(raw: Expression): this;
    public groupBy(columns: string[]): this;
    public groupBy(sq: GroupBySq): this;
    public groupBy(...args: unknown[]): this {
        let [columns] = args as [unknown[]];

        if (!Array.isArray(columns)) {
            columns = [columns as string];
        }

        columns.forEach((column) => {
            if (typeof column === 'string') {
                this.clauses.groupBy.push({ type: 'column', column });
                return;
            }

            if (column instanceof Expression) {
                this.clauses.groupBy.push({ type: 'raw', raw: column });
                return;
            }

            if (typeof column === 'function') {
                this.clauses.groupBy.push({
                    type: 'sub',
                    query: column as GroupBySq,
                });
                return;
            }
        });

        return this;
    }

    public orderBy(columns: `${string} ${OrderByDirection}`[]): this;
    public orderBy(...columns: `${string} ${OrderByDirection}`[]): this;
    public orderBy(column: string, direction: OrderByDirection): this;
    public orderBy(...args: unknown[]): this {
        if (Array.isArray(args[0])) {
            (this.clauses.orderBy as OrderByClause[]).push(...(args[0] as OrderByClause[]));
            return this;
        }

        const [column, direction] = args as [string, OrderByDirection | undefined];

        (this.clauses.orderBy as OrderByClause[]).push({ column, direction: direction as OrderByDirection });

        return this;
    }

    public orderByRandom(): this {
        this.clauses.orderBy = 'random';

        return this;
    }

    public limit(value: number): Builder {
        this.clauses.limit = value;
        return this;
    }

    public offset(value: number): Builder {
        this.clauses.offset = value;
        return this;
    }

    public toSql(): [string, unknown[]] {
        return SqlCompiler.factory().compileQuery(this) ?? ['', []];
    }
}
