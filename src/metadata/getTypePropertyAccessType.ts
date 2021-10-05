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
      typePropertyAccess = 'createOnly';
    } else if (typePropertyAnnotationContainer.isTypePropertyPrivate(Class, propertyName)) {
      typePropertyAccess = 'private';
    } else if (typePropertyAnnotationContainer.isTypePropertyReadOnly(Class, propertyName)) {
      typePropertyAccess = 'readOnly';
    } else if (typePropertyAnnotationContainer.isTypePropertyReadWrite(Class, propertyName)) {
      typePropertyAccess = 'readWrite';
    } else if (typePropertyAnnotationContainer.isTypePropertyUpdateOnly(Class, propertyName)) {
      typePropertyAccess = 'updateOnly';
    } else if (typePropertyAnnotationContainer.isTypePropertyWriteOnly(Class, propertyName)) {
      typePropertyAccess = 'writeOnly';
    } else if (typePropertyAnnotationContainer.isTypePropertyReadUpdate(Class, propertyName)) {
      typePropertyAccess = 'readUpdate';
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
