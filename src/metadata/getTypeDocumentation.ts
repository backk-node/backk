import typeAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';
import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';

export default function getTypeDocumentation<T>(
  typeMetadata: { [key: string]: string } | undefined,
  Class: new () => T
): { [key: string]: string } {
  return Object.keys(typeMetadata ?? {}).reduce((accumulatedTypeDocs, propertyName) => {
    if (typePropertyAnnotationContainer.isTypePropertyPrivate(Class, propertyName)) {
      return accumulatedTypeDocs;
    }

    const typePropertyDocumentation = typeAnnotationContainer.getDocumentationForTypeProperty(
      Class,
      propertyName
    );

    return typePropertyDocumentation
      ? {
          ...accumulatedTypeDocs,
          [propertyName]: typePropertyDocumentation.trim()
        }
      : accumulatedTypeDocs;
  }, {});
}
