import AbstractDbManager from '../../../../AbstractDbManager';
import getMaxLengthValidationConstraint from '../../../../../validation/getMaxLengthValidationConstraint';
import typePropertyAnnotationContainer from '../../../../../decorators/typeproperty/typePropertyAnnotationContainer';

export default function getSqlColumnType(
  dbManager: AbstractDbManager,
  EntityClass: Function,
  fieldName: string,
  baseFieldTypeName: string
): string | undefined {
  switch (baseFieldTypeName) {
    case 'integer':
      return 'INTEGER';
    case 'bigint':
      return 'BIGINT';
    case 'number':
      return 'DOUBLE PRECISION';
    case 'boolean':
      return 'BOOLEAN';
    case 'Date':
      return dbManager.getTimestampType();
    case 'string':
      if (
        (fieldName.endsWith('Id') || fieldName === 'id') &&
        !typePropertyAnnotationContainer.isTypePropertyExternalId(EntityClass, fieldName)
      ) {
        return 'BIGINT';
      } else {
        const maxLength = getMaxLengthValidationConstraint(EntityClass, fieldName);
        return dbManager.getVarCharType(maxLength);
      }
  }

  return undefined;
}
