import { ServiceMetadata } from './types/ServiceMetadata';

export default function findServiceFunctionArgumentType(
  controller: any,
  serviceFunctionName: string
): (new() => any) | undefined {
  const [serviceName, functionName] = serviceFunctionName.split('.');
  const servicesMetadata: ServiceMetadata[] = controller.servicesMetadata;

  const foundServiceMetadata = servicesMetadata.find(
    (serviceMetadata) => serviceMetadata.serviceName === serviceName
  );

  const foundFunctionMetadata = foundServiceMetadata?.functions.find(func => func.functionName === functionName);

  if (foundFunctionMetadata) {
    return controller[serviceName].Types[foundFunctionMetadata.argType];
  }

  return undefined;
}
