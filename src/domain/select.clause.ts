import Builder from '../builder';
import Expression from '../expression';

export type SelectColumnType = 'column' | 'expression' | 'subquery';

export type SelectSq = (sq: Builder) => void;

export type SelectColumn = {
    type: SelectColumnType;
    value?: string | Expression;
    query?: SelectSq;
    alias?: string;
};

interface SelectClause {
    distinct: boolean;
    columns: SelectColumn[];
}

export default SelectClause;
