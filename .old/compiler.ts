import Builder from './builder';
import Clauses from './domain/clauses.interface';
import FromClause, { FromSq } from './domain/from.interface';
import { GroupBy, GroupBySq } from './domain/group-by.interface';
import { JoinClause } from './domain/join.interface';
import OrderByClause from './domain/order-by';
import SelectClause, { SelectSq } from './domain/select.clause';
import WhereClause, { WhereSq } from './domain/where.interface';
import Expression from './expression';

export default class SqlCompiler {
    private builder: Builder | null = null;

    private queryOrderStatement = ['select', 'from', 'join', 'where', 'orderBy', 'groupBy', 'limit', 'offset'];

    constructor(
        public bindings: unknown[] = [],
        public bindingMarker: string = '?',
    ) {}

    public static factory(bindings: unknown[] = [], bindingMarker = '?'): SqlCompiler {
        return new SqlCompiler(bindings, bindingMarker);
    }

    public compileQuery(builder: Builder): [string, unknown[]] {
        const { clauses } = builder;

        this.builder = builder;

        const statements: string[] = [];

        for (const statement of this.queryOrderStatement) {
            const methodName = `compile${statement.charAt(0).toUpperCase()}${statement.slice(1)}` as keyof this;

            if (clauses[statement as keyof Clauses] === undefined) {
                continue;
            }

            const method = this[methodName] as (clause: unknown) => string;
            const sql = method(clauses[statement as keyof Clauses]);

            if (sql) {
                statements.push(sql);
            }
        }

        console.log(statements);

        return [statements.join(' ').trim(), this.bindings];
    }

    private replaceBindingMark(sql: string, index: number): string {
        while (sql.includes(this.bindingMarker)) {
            sql = sql.replace(this.bindingMarker, `$${++index}`);
        }

        return sql;
    }

    public compileSelect(select: SelectClause): string {
        const clause = select.distinct ? 'select distinct' : 'select';

        if (select.columns.length === 0) {
            return `${clause} *`;
        }

        const columns = select.columns.map((column) => {
            if (column.type === 'column') {
                return this.wrapColumn(column.value as string);
            }

            if (column.type === 'expression') {
                const raw = column.value as Expression;

                return this.addBinding(raw.value, raw.bindings);
            }

            if (column.type === 'subquery') {
                const { query, alias } = column as { query: SelectSq; alias: string };
                return `(${this.compileSubQuery(query)}) as ${this.wrapAlias(alias)}`;
            }

            return '';
        });

        return `${clause} ${columns.join(', ')}`;
    }

    public compileFrom(from: FromClause[]): string {
        if (from.length === 0) {
            return '';
        }

        const sqls: string[] = from.map((f) => {
            if (f.type === 'basic') {
                return this.wrapTable(f.table as string, f.alias as string);
            }

            if (f.type === 'subquery') {
                const sql = this.compileSubQuery(f.query as FromSq);

                return `(${sql}) as ${this.wrapAlias(f.alias as string)}`;
            }

            return '';
        });

        return `from ${sqls.join(', ')}`;
    }

    public compileJoin(join: JoinClause[]): string {
        if (join.length === 0) {
            return '';
        }

        return join.map((j) => this.getJoinCompilerMethod(j)).join(' ');
    }

    public compileWhere(wheres: WhereClause[]): string {
        if (wheres.length === 0) {
            return '';
        }

        const sqls: string[] = wheres.map((where, i) => {
            const sql = this.getWhereCompilerMethod(where);

            return i === 0 ? sql : `${where.boolean} ${sql}`;
        });

        return `where ${sqls.join(' ')}`;
    }

    public compileOrderBy(orderBy: OrderByClause[] | 'random'): string {
        if (orderBy.length === 0) {
            return '';
        }

        if (orderBy === 'random') {
            return 'order by random()';
        }

        const sqls: string[] = orderBy.map((order) => {
            if (order.column.match(/\s+(asc|desc)(\s+)?$/i)) {
                const [column, direction] = order.column.split(/\s+/);

                return `${this.wrapColumn(column)} ${direction}`;
            }

            if (!order.direction) {
                return this.wrapColumn(order.column);
            }

            return `${this.wrapColumn(order.column)} ${order.direction}`;
        });

        return `order by ${sqls.join(', ')}`;
    }

    public compileGroupBy(groupBy: GroupBy[]): string {
        if (groupBy.length === 0) {
            return '';
        }

        const columns = groupBy.map((column) => {
            if (column.type === 'column') {
                return this.wrapColumn(column.column as string);
            }

            if (column.type === 'raw') {
                return this.addBinding(column?.raw?.value as string, column?.raw?.bindings as unknown[]);
            }

            if (column.type === 'sub') {
                return `(${this.compileSubQuery(column.query as GroupBySq)})`;
            }
        });

        return `group by ${columns.join(', ')}`;
    }

    public compileLimit(limit: number | undefined): string {
        const sql = `limit ${this.bindingMarker}`;

        if (limit === undefined || limit === null || isNaN(Number(limit))) {
            return '';
        }

        return this.addBinding(sql, [limit]);
    }

    public compileOffset(offset: number | undefined): string {
        const sql = `offset ${this.bindingMarker}`;

        if (offset === undefined || offset === null || isNaN(Number(offset))) {
            return '';
        }

        return this.addBinding(sql, [offset]);
    }

    private compileWhereBasic(where: WhereClause): string {
        const sql = `${this.wrapColumn(where.column as string)} ${where.operator} `;

        if (where.value instanceof Expression) {
            return this.addBinding(`${sql}${where.value.value}`, where.value.bindings);
        }

        return this.addBinding(`${sql}${this.bindingMarker}`, [where.value]);
    }

    private compileWhereIn(where: WhereClause, not = false): string {
        const clause = not ? 'not in' : 'in';
        const bindings: unknown[] = [];
        const sql = `${this.wrapColumn(where.column as string)} ${clause}`;
        const inValues = (where.value as unknown[]).map((v) => {
            bindings.push(v);
            return this.bindingMarker;
        });

        return this.addBinding(`${sql}(${inValues})`, bindings);
    }

    private compileWhereInSub(where: WhereClause, not = false): string {
        const clause = not ? 'not in' : 'in';

        return `${this.wrapColumn(where.column as string)} ${clause}(${this.compileSubQuery(where.query as WhereSq)})`;
    }

    private compileWhereNull(where: WhereClause, not = false): string {
        const clause = not ? 'not null' : 'null';
        return `${this.wrapColumn(where.column as string)} ${where.operator} ${clause}`;
    }

    private compileWhereBetween(where: WhereClause, not = false): string {
        const clause = not ? 'not between' : 'between';
        const sql = `${this.wrapColumn(where.column as string)} ${clause}`;
        const bindings = (where.value ?? []) as [unknown, unknown];

        return this.addBinding(`${sql} ${this.bindingMarker} and ${this.bindingMarker}`, bindings);
    }

    private compileWhereExists(where: WhereClause, not = false): string {
        const clause = not ? 'not exists' : 'exists';
        return `${clause}(${this.compileSubQuery(where.query as WhereSq)})`;
    }

    private compileWhereRaw(where: WhereClause): string {
        // TODO: Cambiar expression por raw y verificar si raw ya contiene bindings, ya que expressión debe ser una clase Expression
        return this.addBinding(where.expression as string, where.bindings as unknown[]);
    }

    private compileWhereSub(where: WhereClause): string {
        const { column, operator, query } = where as { column: string; operator: string; query: WhereSq };
        return `${this.wrapColumn(column)} ${operator} (${this.compileSubQuery(query)})`;
    }

    private compileWhereNested(where: WhereClause): string {
        let sql = '';

        where?.nested?.clauses.forEach((clause, i) => {
            const isql = this.getWhereCompilerMethod(clause);
            sql += i === 0 ? isql : ` ${clause.boolean} ${isql}`;
        });

        return `(${sql})`;
    }

    private getWhereCompilerMethod(where: WhereClause): string {
        switch (where.type) {
            case 'basic':
                return this.compileWhereBasic(where);
            case 'in':
                return this.compileWhereIn(where);
            case 'notIn':
                return this.compileWhereIn(where, true);
            case 'inSub':
                return this.compileWhereInSub(where);
            case 'notInSub':
                return this.compileWhereInSub(where, true);
            case 'null':
                return this.compileWhereNull(where);
            case 'notNull':
                return this.compileWhereNull(where, true);
            case 'between':
                return this.compileWhereBetween(where);
            case 'notBetween':
                return this.compileWhereBetween(where, true);
            case 'exists':
                return this.compileWhereExists(where);
            case 'notExists':
                return this.compileWhereExists(where, true);
            case 'raw':
                return this.compileWhereRaw(where);
            case 'sub':
                return this.compileWhereSub(where);
            case 'nested':
                return this.compileWhereNested(where);
            default:
                return '';
        }
    }

    private compileJoinBasic(join: JoinClause): string {
        if (typeof join.first === 'string') {
            return `${join.join} join ${this.wrapTable(join.table, join.alias)} on ${this.wrapColumn(join.first)} ${
                join.operator
            } ${this.wrapColumn(join.second)}`;
        }

        if (Array.isArray(join.first)) {
            return this.compileJoinNested(join);
        }
    }

    private compileJoinNested(join: JoinClause): string {
        const nested = join.nested.map((n, i) => {
            const first = this.wrapColumn(n.first);
            const second = this.wrapColumn(n.second);

            if (i === 0) {
                return `${first} ${n.operator} ${second}`;
            }

            return `${n.boolean} ${first} ${n.operator} ${second}`;
        });

        return `${join.join} join ${this.wrapTable(join.table, join.alias)} on ${nested.join(' ')}`;
    }

    private compileJoinSub(join: JoinClause): string {
        const sql = this.compileSubQuery(join.query);

        return `${join.join} join (${sql}) as ${this.wrapAlias(join.alias)} on ${this.wrapColumn(join.first)} ${
            join.operator
        } ${this.wrapColumn(join.second)}`;
    }

    private compileJoinTable(join: JoinClause): string {
        return `${join.join} join ${this.wrapTable(join.table, join.alias)} on ${this.wrapColumn(join.first)} ${
            join.operator
        } ${this.wrapColumn(join.second)}`;
    }

    private compileJoinSubNested(join: JoinClause): string {
        const sql = this.compileSubQuery(join.query);

        const nested = join.nested.map((n, i) => {
            const first = this.wrapColumn(n.first);
            const second = this.wrapColumn(n.second);

            if (i === 0) {
                return `${first} ${n.operator} ${second}`;
            }

            return `${n.boolean} ${first} ${n.operator} ${second}`;
        });

        return `${join.join} join (${sql}) as ${this.wrapAlias(join.alias)} on ${nested.join(' ')}`;
    }

    private getJoinCompilerMethod(j: JoinClause): string {
        switch (j.type) {
            case 'basic':
                return this.compileJoinBasic(j);
            case 'nested':
                return this.compileJoinNested(j);
            case 'sub':
                return this.compileJoinSub(j);
            case 'subNested':
                return this.compileJoinSubNested(j);
            case 'table':
                return this.compileJoinTable(j);
            default:
                return '';
        }
    }

    private newCompiler(): SqlCompiler {
        return new SqlCompiler(this.bindings, this.bindingMarker);
    }

    private compileSubQuery(sq: (sq: Builder) => void): string {
        const compiler = this.newCompiler();
        const builder = this.builder?.newQuery();

        sq(builder);

        const [sql, bindings] = compiler.compileQuery(builder);
        const newSQL = this.replaceBindingMark(sql, this.bindings.length - 1);

        this.bindings = bindings;

        return newSQL;
    }

    private addBinding(sql: string, bindings: unknown[]): string {
        const newSQL = this.replaceBindingMark(sql, this.bindings.length);
        this.bindings.push(...bindings);
        return newSQL;
    }

    protected wrapTable(table: string, as?: string): string {
        const [_table, _as] = this.splitAlias(table);

        const stm = _table
            .split('.')
            .map((v) => `"${v}"`)
            .join('.');

        if (_as) {
            return `${stm} as ${this.wrapAlias(_as)}`;
        }

        if (as) {
            return `${stm} as ${this.wrapAlias(as)}`;
        }

        return stm;
    }

    protected splitAlias(stm: string): [string, string?] {
        if (!stm) {
            return ['', undefined];
        }

        const [first, _as] = stm.split(/\s+(?:as\s+)?/i);

        return [first, _as];
    }

    // This function is used to wrap the column name, in order to avoid conflicts with reserved words and special characters
    protected wrapColumn(column: string | Expression): string {
        if (column instanceof Expression) {
            return this.addBinding(column.value.toString().trim(), column.bindings);
        }

        // Separate the column from the alias
        const [col, as] = this.splitAlias(column);

        const regex = /([^\\.\\:\\(\\),]+\.?)+(::[^\\.\\:\\(\\),]*)*/g;

        // Replace each group of characters with double quotes and a point
        const ncolumn = col.replace(regex, (match) => match.replace(/([^\\.\\:\\(\\),]+)/g, '"$1"'));

        if (as) {
            return `${ncolumn} as ${this.wrapAlias(as)}`;
        }

        return ncolumn;
    }

    protected wrapValue(value: string): string {
        if (this.isSqlConstant(value) || this.isSqlFunction(value)) {
            return value;
        }

        if (value.includes('*')) {
            return value;
        }

        if (value.includes('->') || !isNaN(Number(value)) || typeof value === 'boolean') {
            return value;
        }

        return `'${value}'`;
    }

    protected wrapAlias(as: string): string {
        return `"${as}"`;
    }

    protected isSqlConstant(value: string): boolean {
        return value.match(/^(CURRENT_TIMESTAMP|CURRENT_DATE|CURRENT_TIME|NULL)$/i) !== null;
    }

    protected isSqlFunction(value: string): boolean {
        return value.includes('(') && value.includes(')');
    }
}
