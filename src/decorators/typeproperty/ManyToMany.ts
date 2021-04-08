import typeAnnotationContainer from "./typePropertyAnnotationContainer";

export function ManyToMany() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    typeAnnotationContainer.setTypePropertyAsManyToMany(object.constructor, propertyName);
  };
}
