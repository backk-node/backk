export default class SqlExpression {
    readonly expression: string;
    readonly values?: object | undefined;
    readonly subEntityPath: string;
    constructor(expression: string, values?: object | undefined, subEntityPath?: string);
    toSqlString(): string;
    getValues(): object | undefined;
    hasValues(): boolean;
}
