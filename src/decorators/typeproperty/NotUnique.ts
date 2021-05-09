import typeAnnotationContainer from './typePropertyAnnotationContainer';

export default function NotUnique() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsNotUnique(object.constructor, propertyName);
  };
}
