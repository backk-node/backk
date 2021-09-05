import typeAnnotationContainer from './typePropertyAnnotationContainer';

export default function NotHashed(reason: string) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsNotHashed(object.constructor, propertyName);
  };
}
