import entityAnnotationContainer from '../entity/entityAnnotationContainer';

export type SortOrder = 'ASC' | 'DESC'

export default function Index(
  sortOrder?: SortOrder,
  usingOption?: string,
  additionalSqlCreateIndexStatementOptions?: string
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    entityAnnotationContainer.addEntityIndex(object.constructor.name + ':' + propertyName, [propertyName]);
    entityAnnotationContainer.addIndexSortOrder(object.constructor.name + ':' + propertyName, sortOrder ?? 'ASC');
    entityAnnotationContainer.addUsingOptionForIndex(
      object.constructor.name + ':' + propertyName,
      usingOption
    );
    entityAnnotationContainer.addAdditionalSqlCreateIndexStatementOptionsForIndex(
      object.constructor.name + ':' + propertyName,
      additionalSqlCreateIndexStatementOptions
    );
  };
}
