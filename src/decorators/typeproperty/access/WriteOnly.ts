import typeAnnotationContainer from '../typePropertyAnnotationContainer';

export default function WriteOnly() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsWriteOnly(object.constructor, propertyName);
  };
}
