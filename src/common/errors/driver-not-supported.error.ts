import { Drivers } from '../drivers';

export default class DriverNotSupportedError extends Error {
    readonly '@instanceOf' = Symbol.for('DriverNotSupportedError');

    constructor(driver: Drivers) {
        super(`Driver '${driver}' is not supported.`);
        this.name = 'DriverNotSupportedError';
    }
}
