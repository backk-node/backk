import { ValidationOptions } from 'class-validator';
import { Name } from '../../types/Name';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
export default function IsOneOf(getPossibleValuesFunc: () => PromiseErrorOr<Name[]>, serviceFunctionName: string, testValue: string, validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
