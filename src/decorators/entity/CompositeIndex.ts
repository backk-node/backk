import entityContainer from './entityAnnotationContainer';

export default function CompositeIndex(
  indexFields: string[],
  usingOption?: string,
  additionalSqlCreateIndexStatementOptions?: string
) {
  return function(entityClass: Function) {
    entityContainer.addEntityIndex(entityClass.name + ':' + indexFields.join('_'), indexFields);
    entityContainer.addUsingOptionForIndex(entityClass.name + ':' + indexFields.join('_'), usingOption);
    entityContainer.addAdditionalSqlCreateIndexStatementOptionsForIndex(
      entityClass.name + ':' + indexFields.join('_'),
      additionalSqlCreateIndexStatementOptions
    );
  };
}
