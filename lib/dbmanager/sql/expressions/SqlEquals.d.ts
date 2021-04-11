import SqlExpression from "./SqlExpression";
export default class SqlEquals<T> extends SqlExpression {
    private readonly filters;
    constructor(filters: Partial<T>, subEntityPath?: string);
    getValues(): Partial<T>;
    hasValues(): boolean;
    toSqlString(): string;
}
