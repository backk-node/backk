import AbstractDbManager from '../dbmanager/AbstractDbManager';
export default function tryValidateServiceFunctionArgument(ServiceClass: Function, functionName: string, dbManager: AbstractDbManager | undefined, serviceFunctionArgument: object): Promise<void>;
