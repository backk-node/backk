import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';

export default function AuditLog<T extends object, U extends any>(
  shouldLog: (argument: T, returnValue: U) => boolean,
  attributesToLog: (argument: T, returnValue: U) => { [key: string]: any }
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    serviceFunctionAnnotationContainer.addServiceFunctionAuditLog(
      object.constructor,
      functionName,
      shouldLog,
      attributesToLog
    );
  };
}
