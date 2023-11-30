import Builder from '../builder';
import Expression from '../expression';
import WhereClauses from '../where-clauses';
import { Operators } from './operators';

export type WhereBoolean = 'and' | 'or';

export type WhereValue = Expression | string | number | boolean | null;

export type WhereSq = (sq: Builder) => void;

export type WhereNested = (where: WhereClauses) => void;

export type WhereType =
    | 'basic'
    | 'nested'
    | 'sub'
    | 'in'
    | 'inSub'
    | 'notInSub'
    | 'notIn'
    | 'null'
    | 'notNull'
    | 'between'
    | 'notBetween'
    | 'exists'
    | 'notExists'
    | 'raw';

export default interface WhereClause {
    boolean: WhereBoolean;
    type: WhereType;
    column?: string;
    operator?: Operators;
    value?: WhereValue;
    query?: WhereSq;
    nested?: WhereClauses;
    expression?: string;
    bindings?: unknown[];
}
