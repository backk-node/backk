import typeAnnotationContainer from './typePropertyAnnotationContainer';

export function Unique() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsUnique(object.constructor, propertyName);
  };
}
