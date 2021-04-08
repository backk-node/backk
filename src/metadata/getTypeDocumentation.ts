import typeAnnotationContainer from "../decorators/typeproperty/typePropertyAnnotationContainer";

export default function getTypeDocumentation<T>(
  typeMetadata: { [key: string]: string } | undefined,
  TypeClass: new () => T
): { [key: string]: string } {
  return Object.keys(typeMetadata ?? {}).reduce((accumulatedTypeDocs, propertyName) => {
    const typePropertyDocumentation = typeAnnotationContainer.getDocumentationForTypeProperty(
      TypeClass,
      propertyName
    );

    return typePropertyDocumentation
      ? {
        ...accumulatedTypeDocs,
        [propertyName]: typePropertyDocumentation
      }
      : accumulatedTypeDocs;
  }, {});
}
