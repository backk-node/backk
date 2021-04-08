import shouldUseRandomInitializationVector from "../../../crypt/shouldUseRandomInitializationVector";
import shouldEncryptValue from "../../../crypt/shouldEncryptValue";
import encrypt from "../../../crypt/encrypt";

export default class SqlExpression {
  constructor(readonly expression: string, readonly values?: object, readonly subEntityPath = '') {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toSqlString(): string {
    return this.expression;
  }

  getValues(): object | undefined {
    if (this.values) {
      return Object.entries(this.values).reduce((filterValues, [fieldName, fieldValue]) => {
        let finalFieldValue = fieldValue;

        if (!shouldUseRandomInitializationVector(fieldName) && shouldEncryptValue(fieldName)) {
          finalFieldValue = encrypt(fieldValue as any, false);
        }

        return {
          ...filterValues,
          [fieldName]: finalFieldValue
        };
      }, {});
    }

    return this.values;
  }

  hasValues(): boolean {
    return Object.values(this.values || {}).reduce(
      (hasValues: boolean, value: any) => hasValues && value !== undefined,
      true
    );
  }
}
