import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export type UpdateType = 'update' | 'addOrRemove';

export function Update(updateType: UpdateType) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addUpdateAnnotation(object.constructor, functionName, updateType);
  };
}
