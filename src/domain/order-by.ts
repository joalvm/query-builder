export type OrderByDirection = 'asc' | 'desc';

export default interface OrderByClause {
    column: string;
    direction: OrderByDirection;
}
