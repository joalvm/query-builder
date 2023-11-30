import Builder from '../builder';
import Expression from '../expression';

export type GroupByType = 'raw' | 'sub' | 'column';

export type GroupBySq = (sq: Builder) => void;

export interface GroupBy {
    type: GroupByType;
    column?: string;
    query?: GroupBySq;
    raw?: Expression;
}
