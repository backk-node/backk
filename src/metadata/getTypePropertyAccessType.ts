import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';

export default function getTypePropertyAccessType<T>(
  typeMetadata: { [key: string]: string } | undefined,
  Class: new () => T
): { [key: string]: string } {
  return Object.keys(typeMetadata ?? {}).reduce((accumulatedTypePropertyModifiers, propertyName) => {
    let typePropertyAccess;

    if (typePropertyAnnotationContainer.isTypePropertyCreateOnly(Class, propertyName)) {
      typePropertyAccess = '@CreateOnly()';
    } else if (typePropertyAnnotationContainer.isTypePropertyPrivate(Class, propertyName)) {
      typePropertyAccess = '@Private()';
    } else if (typePropertyAnnotationContainer.isTypePropertyReadOnly(Class, propertyName)) {
      typePropertyAccess = '@ReadOnly()';
    } else if (typePropertyAnnotationContainer.isTypePropertyReadWrite(Class, propertyName)) {
      typePropertyAccess = '@ReadWrite()';
    } else if (typePropertyAnnotationContainer.isTypePropertyUpdateOnly(Class, propertyName)) {
      typePropertyAccess = '@UpdateOnly()';
    } else if (typePropertyAnnotationContainer.isTypePropertyWriteOnly(Class, propertyName)) {
      typePropertyAccess = '@WriteOnly';
    } else if (typePropertyAnnotationContainer.isTypePropertyReadUpdate(Class, propertyName)) {
      typePropertyAccess = '@ReadUpdate';
    } else {
      throw new Error('Unsupported property access type');
    }

    return {
      ...accumulatedTypePropertyModifiers,
      [propertyName]: typePropertyAccess
    };
  }, {});
}
