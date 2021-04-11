import { ValidationOptions } from 'class-validator';
export default function IsUndefined(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
