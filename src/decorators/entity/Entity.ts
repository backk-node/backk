import entityContainer from './entityAnnotationContainer';
import types from '../../types/types';

export default function Entity(
  referenceToEntity?: string,
  additionalSqlCreateTableStatementOptions?: string
) {
  return function(EntityClass: Function) {
    const foundInternalEntityClass = Object.values(types).find((type) => type === EntityClass);
    if (
      !foundInternalEntityClass &&
      !EntityClass.name.startsWith('__Backk') &&
      !EntityClass.name.match(/^[a-zA-Z][a-zA-Z0-9]*$/)
    ) {
      throw new Error(
        EntityClass.name + ': entity class name must match regular expression: /^[a-zA-Z][a-zA-Z0-9]*$/'
      );
    }

    entityContainer.addEntityNameAndClass(EntityClass.name, EntityClass);

    if (referenceToEntity) {
      entityContainer.addEntityTableName(EntityClass.name, referenceToEntity);
    }

    if (additionalSqlCreateTableStatementOptions) {
      entityContainer.addAdditionalSqlCreateTableStatementOptionsForEntity(
        EntityClass.name,
        additionalSqlCreateTableStatementOptions
      );
    }
  };
}
