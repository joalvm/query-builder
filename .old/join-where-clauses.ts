import { JoinWhereClause } from './domain/join.interface';
import { Operators } from './domain/operators';
import { WhereBoolean } from './domain/where.interface';
import Expression from './expression';

export default class JoinWhereClauses {
    public clauses: JoinWhereClause[] = [];

    public static create(): JoinWhereClauses {
        return new JoinWhereClauses();
    }

    on(first: string | Expression, second: string | Expression, boolean?: WhereBoolean): this;
    on(first: string | Expression, operator?: Operators, second?: string | Expression, boolean?: WhereBoolean): this;
    on(...args: unknown[]): this {
        const [first, operator, second, boolean = 'and'] = args;

        if (second === undefined) {
            this.clauses.push({
                boolean: boolean as WhereBoolean,
                first: first as string,
                operator: '=',
                second: operator as string,
            });

            return this;
        }

        this.clauses.push({
            boolean: boolean as WhereBoolean,
            first: first as string,
            operator: operator as Operators,
            second: second as string,
        });

        return this;
    }

    orOn(first: string | Expression, second: string | Expression): this;
    orOn(first: string | Expression, operator?: Operators, second?: string | Expression): this;
    orOn(...args: unknown[]): this {
        const [first, operator, second] = args;

        return this.on(first as string, operator as Operators, second as string, 'or');
    }
}
