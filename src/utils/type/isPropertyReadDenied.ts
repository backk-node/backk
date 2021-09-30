import typePropertyAnnotationContainer from "../../decorators/typeproperty/typePropertyAnnotationContainer";

export default function isPropertyReadDenied(Class: Function, propertyName: string) {
  return typePropertyAnnotationContainer.isTypePropertyCreateOnly(Class, propertyName) ||
    typePropertyAnnotationContainer.isTypePropertyPrivate(Class, propertyName) ||
    typePropertyAnnotationContainer.isTypePropertyUpdateOnly(Class, propertyName) ||
    typePropertyAnnotationContainer.isTypePropertyWriteOnly(Class, propertyName)
}
