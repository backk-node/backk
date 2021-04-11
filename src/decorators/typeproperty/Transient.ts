import typeAnnotationContainer from './typePropertyAnnotationContainer';

export default function Transient() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsTransient(object.constructor, propertyName);
  };
}
