import SqlExpression from './SqlExpression';
import shouldUseRandomInitializationVector from "../../../crypt/shouldUseRandomInitializationVector";
import shouldEncryptValue from "../../../crypt/shouldEncryptValue";
import encrypt from "../../../crypt/encrypt";

export default class SqlInExpression extends SqlExpression {
  constructor(
    readonly fieldName: string,
    readonly inExpressionValues?: any[],
    subEntityPath = '',
    readonly fieldExpression?: string
  ) {
    super('', {}, subEntityPath);
  }

  getValues(): object {
    if (this.inExpressionValues) {
      return this.inExpressionValues.reduce((filterValues, value, index) => {
        let finalValue = value;

        if (!shouldUseRandomInitializationVector(this.fieldName) && shouldEncryptValue(this.fieldName)) {
          finalValue = encrypt(value as any, false);
        }

        return {
          ...filterValues,
          [`${this.subEntityPath.replace('_', 'xx')}xx${this.fieldName.replace('_', 'xx')}${index +
            1}`]: finalValue
        };
      }, {});
    }

    return {};
  }

  hasValues(): boolean {
    return this.inExpressionValues !== undefined && this.inExpressionValues.length > 0;
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

    return (this.fieldExpression ?? this.fieldName) + ' IN (' + values + ')';
  }
}
