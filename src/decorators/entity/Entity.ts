import entityContainer from "./entityAnnotationContainer";

export default function Entity(
  referenceToEntity?: string,
  additionalSqlCreateTableStatementOptions?: string
) {
  return function(EntityClass: Function) {
    if (
      !EntityClass.name.startsWith('__Backk') &&
      !EntityClass.name.match(/^[A-Z][a-zA-Z0-9]*$/)
    ) {
      throw new Error(
        EntityClass.name + ': entity class name must match regular expression: /^[A-Z][a-zA-Z0-9]*$/'
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
