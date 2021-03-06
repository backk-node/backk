import typeAnnotationContainer from './typePropertyAnnotationContainer';

export default function Hashed() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsHashed(object.constructor, propertyName);
  };
}
