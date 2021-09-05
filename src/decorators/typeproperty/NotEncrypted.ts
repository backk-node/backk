import typeAnnotationContainer from './typePropertyAnnotationContainer';

export default function NotEncrypted(reason: string) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsNotEncrypted(object.constructor, propertyName);
  };
}
