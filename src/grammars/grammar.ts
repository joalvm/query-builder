abstract class Grammar {
    readonly '@instanceOf' = Symbol.for('Grammar');

    protected operators: string[] = [];

    public getOperators(): string[] {
        return this.operators;
    }
}

export default Grammar;
