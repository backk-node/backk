import SqlExpression from './SqlExpression';
export default class SqlInExpression extends SqlExpression {
    readonly fieldName: string;
    readonly inExpressionValues?: any[] | undefined;
    readonly fieldExpression?: string | undefined;
    constructor(fieldName: string, inExpressionValues?: any[] | undefined, subEntityPath?: string, fieldExpression?: string | undefined);
    getValues(): object;
    hasValues(): boolean;
    toSqlString(): string;
}
