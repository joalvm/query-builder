export const drivers = ['mysql', 'postgres', 'sqlite', 'mssql'] as const;

export type Drivers = (typeof drivers)[number];
