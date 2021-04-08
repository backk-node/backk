import entityAnnotationContainer from "../../decorators/entity/entityAnnotationContainer";

export default function isEntityTypeName(typeName: string): boolean {
  return entityAnnotationContainer.entityNameToClassMap[typeName] &&
    typeName[0] === typeName[0].toUpperCase() &&
    typeName[0] !== '('
}
