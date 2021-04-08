import typeAnnotationContainer from './typePropertyAnnotationContainer';

export function NotHashed() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsNotHashed(object.constructor, propertyName);
  };
}
