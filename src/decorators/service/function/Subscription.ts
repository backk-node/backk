import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function Subscription() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addSubscription(
      object.constructor,
      functionName
    );
  };
}
