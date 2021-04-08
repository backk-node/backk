import typeAnnotationContainer from './typePropertyAnnotationContainer';

export function Encrypted() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsEncrypted(object.constructor, propertyName);
  };
}
