export default class Expression {
    constructor(
        public value: string,
        public bindings: unknown[] = [],
    ) {
        this.value = value || '';
        this.bindings = bindings || [];
    }
}
