import Expression from '../expression';
import FromClause from './from.interface';
import { GroupBy } from './group-by.interface';
import { JoinClause } from './join.interface';
import OrderByClause from './order-by';
import SelectClause from './select.clause';
import WhereClause from './where.interface';

export default interface Clauses {
    distinct: boolean | string[] | Expression;
    select: SelectClause;
    from: FromClause[];
    join: JoinClause[];
    where: WhereClause[];
    groupBy: GroupBy[];
    having: WhereClause[];
    orderBy: 'random' | OrderByClause[];
    union: string[];
    unionOrder: string[];
    limit: number | undefined;
    offset: number | undefined;
}
