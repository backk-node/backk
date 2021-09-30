import typeAnnotationContainer from '../typePropertyAnnotationContainer';

export default function ReadWrite() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsReadWrite(object.constructor, propertyName);
  };
}
