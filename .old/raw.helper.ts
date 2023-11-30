import Expression from './expression';

/**
 * Create a raw expression
 *
 * @param value expression value
 * @param bindings bindings
 * @returns {Expression}
 */
export default function raw(value: string, bindings: unknown[] = []): Expression {
    return new Expression(value, bindings);
}
