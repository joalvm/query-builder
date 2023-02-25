import Builder from '../builder';
import Expression from '../expression';
import JoinWhereClauses from '../join-where-clauses';
import { Operators } from './operators';
import { WhereBoolean } from './where.interface';

export type Join = 'inner' | 'left' | 'right' | 'full' | 'cross';
export type JoinType = 'basic' | 'nested' | 'sub' | 'subNested' | 'table';

export type JoinSq = (sq: Builder) => void;
export type JoinNested = (joins: JoinWhereClauses) => void;

export interface JoinClause {
    type: JoinType;
    join: Join;
    table?: string;
    first?: string | Expression;
    operator?: string;
    second?: string | Expression;
    query?: JoinSq;
    nested?: JoinWhereClause[];
    alias?: string;
}

export interface JoinWhereClause {
    boolean: WhereBoolean;
    first: string | Expression;
    operator: Operators;
    second: string | Expression;
}
