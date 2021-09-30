import typeAnnotationContainer from '../typePropertyAnnotationContainer';

export default function UpdateOnly() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsUpdateOnly(object.constructor, propertyName);
  };
}
