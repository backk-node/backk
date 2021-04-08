import entityAnnotationContainer from "../../decorators/entity/entityAnnotationContainer";

export default function getTableName(entityName: string): string {
  if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
    return entityAnnotationContainer.entityNameToTableNameMap[entityName].toLowerCase()
  }

  return entityName.toLowerCase();
}

export function getEntityName(entityName: string): string {
  if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
    return entityAnnotationContainer.entityNameToTableNameMap[entityName]
  }

  return entityName;
}
