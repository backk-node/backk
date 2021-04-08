import typeAnnotationContainer from './typePropertyAnnotationContainer';

export function OneToMany(isReferenceToExternalEntity = false) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsOneToMany(
      object.constructor,
      propertyName,
      isReferenceToExternalEntity
    );
  };
}
