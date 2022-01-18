import entityContainer from './entityAnnotationContainer';
import { SortOrder } from "../typeproperty/Indexed";

export default function UniqueCompositeIndex(
  indexFields: string[],
  sortOrder: SortOrder = 'ASC',
  usingOption?: string,
  additionalSqlCreateIndexStatementOptions?: string
) {
  return function(entityClass: Function) {
    entityContainer.addEntityUniqueIndex(entityClass.name + ':' + indexFields.join('_'), indexFields);
    entityContainer.addIndexSortOrder(entityClass.name + ':' + indexFields.join('_'), sortOrder);
    entityContainer.addUsingOptionForIndex(entityClass.name + ':' + indexFields.join('_'), usingOption);
    entityContainer.addAdditionalSqlCreateIndexStatementOptionsForIndex(
      entityClass.name + ':' + indexFields.join('_'),
      additionalSqlCreateIndexStatementOptions
    );
  };
}
