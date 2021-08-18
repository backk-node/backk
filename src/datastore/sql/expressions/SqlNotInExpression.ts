import SqlInExpression from './SqlInExpression';

export default class SqlNotInExpression extends SqlInExpression {
  constructor(
    readonly fieldName: string,
    readonly notInExpressionValues?: any[],
    subEntityPath = '',
    fieldExpression?: string
  ) {
    super(fieldName, notInExpressionValues, subEntityPath, fieldExpression);
  }

  toSqlString(): string {
    if (!this.inExpressionValues) {
      return '';
    }

    const values = this.inExpressionValues
      .map(
        (_, index) =>
          ':' +
          this.subEntityPath.replace('_', 'xx') +
          'xx' +
          this.fieldName.replace('_', 'xx') +
          (index + 1).toString()
      )
      .join(', ');

    return (this.fieldExpression ?? this.fieldName) + ' NOT IN (' + values + ')';
  }
}
