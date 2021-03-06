import typeAnnotationContainer from './typePropertyAnnotationContainer';

export default function IsExternalId() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsExternalId(object.constructor, propertyName);
  };
}
