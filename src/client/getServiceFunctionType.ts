import { ServiceFunctionType } from './generateClients';

export default function getServiceFunctionType(functionName: string, decorators: any): ServiceFunctionType {
  const isCreateFunction = !!decorators?.find(
    (decorator: any) => decorator.expression.callee.name === 'Create'
  );
  const isUpdateFunction = !!decorators?.find(
    (decorator: any) => decorator.expression.callee.name === 'Update'
  );

  if (isCreateFunction || functionName.startsWith('create') || functionName.startsWith('insert')) {
    return 'create';
  } else if (
    isUpdateFunction ||
    functionName.startsWith('update') ||
    functionName.startsWith('modify') ||
    functionName.startsWith('change') ||
    functionName.startsWith('patch')
  ) {
    return 'update';
  }

  return 'other';
}
