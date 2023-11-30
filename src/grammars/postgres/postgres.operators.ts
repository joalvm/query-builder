export const pgOperators = [
    '=',
    '<',
    '>',
    '<=',
    '>=',
    '<>',
    '!=',
    'like',
    'not like',
    'between',
    'ilike',
    'not ilike',
    '~',
    '&',
    '|',
    '#',
    '<<',
    '>>',
    '<<=',
    '>>=',
    '&&',
    '@>',
    '<@',
    '?',
    '?|',
    '?&',
    '||',
    '-',
    '@?',
    '@@',
    '#-',
    'is distinct from',
    'is not distinct from',
] as const;

export const pgBitwiseOperators = ['~', '&', '|', '#', '<<', '>>', '<<=', '>>='] as const;

export type PgOperators = (typeof pgOperators)[number];

export type PgBitwiseOperators = (typeof pgBitwiseOperators)[number];
