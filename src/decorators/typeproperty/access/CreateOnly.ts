import typeAnnotationContainer from '../typePropertyAnnotationContainer';

export default function CreateOnly() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsCreateOnly(object.constructor, propertyName);
  };
}
