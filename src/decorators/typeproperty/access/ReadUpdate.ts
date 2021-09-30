import typeAnnotationContainer from '../typePropertyAnnotationContainer';

export default function ReadUpdate() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsReadUpdate(object.constructor, propertyName);
  };
}
