import SqlInExpression from './SqlInExpression';
export default class SqlNotInExpression extends SqlInExpression {
    readonly fieldName: string;
    readonly notInExpressionValues?: any[] | undefined;
    constructor(fieldName: string, notInExpressionValues?: any[] | undefined, subEntityPath?: string, fieldExpression?: string);
    toSqlString(): string;
}
