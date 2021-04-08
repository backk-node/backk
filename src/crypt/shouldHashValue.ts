import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';

export default function shouldHashValue(propertyName: string, EntityClass: Function): boolean {
  return (
    (propertyName.toLowerCase().includes('password') ||
      typePropertyAnnotationContainer.isTypePropertyHashed(EntityClass, propertyName)) &&
    !typePropertyAnnotationContainer.isTypePropertyNotHashed(EntityClass, propertyName)
  );
}
