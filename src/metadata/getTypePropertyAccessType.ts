import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';
import entityAnnotationContainer from '../decorators/entity/entityAnnotationContainer';

export default function getTypePropertyAccessType<T>(
  typeMetadata: { [key: string]: string } | undefined,
  Class: new () => T
): { [key: string]: string } {
  if (!entityAnnotationContainer.isEntity(Class)) {
    return {};
  }

  return Object.keys(typeMetadata ?? {}).reduce((accumulatedTypePropertyModifiers, propertyName) => {
    if (typePropertyAnnotationContainer.isTypePropertyPrivate(Class, propertyName)) {
      return accumulatedTypePropertyModifiers;
    }

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
      typePropertyAccess = '@WriteOnly()';
    } else if (typePropertyAnnotationContainer.isTypePropertyReadUpdate(Class, propertyName)) {
      typePropertyAccess = '@ReadUpdate()';
    } else {
      throw new Error(
        Class.name + '.' + propertyName + ': Unsupported property access type: ' + typePropertyAccess
      );
    }

    return {
      ...accumulatedTypePropertyModifiers,
      [propertyName]: typePropertyAccess
    };
  }, {});
}
