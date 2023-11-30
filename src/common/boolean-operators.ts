export const booleanOperators = ['and', 'or'] as const;

export type BooleanOperator = (typeof booleanOperators)[number];
