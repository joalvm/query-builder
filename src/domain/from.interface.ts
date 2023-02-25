import Builder from '../builder';

export type FromType = 'basic' | 'subquery';

export type FromSq = (sq: Builder) => void;

export default interface FromClause {
    type: FromType;
    table?: string;
    alias?: string;
    query?: FromSq;
}
