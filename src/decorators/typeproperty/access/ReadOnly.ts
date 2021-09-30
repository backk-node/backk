import typeAnnotationContainer from '../typePropertyAnnotationContainer';

export default function ReadOnly() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsReadOnly(object.constructor, propertyName);
  };
}
