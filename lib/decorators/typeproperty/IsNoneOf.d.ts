import { ValidationOptions } from 'class-validator';
import { BackkError } from '../../types/BackkError';
import { Name } from '../../types/Name';
export default function IsNoneOf(getPossibleValuesFunc: () => Promise<[Name[], BackkError | null]>, serviceFunctionName: string, testValue: string, validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
