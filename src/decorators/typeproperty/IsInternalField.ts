import typeAnnotationContainer from './typePropertyAnnotationContainer';

export function IsInternalField() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsInternal(object.constructor, propertyName);
  };
}
