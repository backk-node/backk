import entityAnnotationContainer, {
  EntityJoinSpec
} from '../../../../../decorators/entity/entityAnnotationContainer';

export default function addArrayValuesTableJoinSpec(
  entityName: string,
  fieldName: string,
  subEntityForeignIdFieldName: string
) {
  let tableName = entityName;

  if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
    tableName = entityAnnotationContainer.entityNameToTableNameMap[entityName];
  }

  const entityJoinSpec: EntityJoinSpec = {
    entityFieldName: fieldName,
    subEntityTableName: (tableName + '_' + fieldName.slice(0, -1)).toLowerCase(),
    entityIdFieldName: '_id',
    subEntityForeignIdFieldName,
    isReadonly: false
  };

  if (entityAnnotationContainer.entityNameToJoinsMap[entityName]) {
    entityAnnotationContainer.entityNameToJoinsMap[entityName].push(entityJoinSpec);
  } else {
    entityAnnotationContainer.entityNameToJoinsMap[entityName] = [entityJoinSpec];
  }
}
