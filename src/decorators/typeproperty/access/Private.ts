import typeAnnotationContainer from '../typePropertyAnnotationContainer';

export default function Private() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsPrivate(object.constructor, propertyName);
  };
}
