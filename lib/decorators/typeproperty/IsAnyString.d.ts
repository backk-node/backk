import { ValidationOptions } from 'class-validator';
export default function IsAnyString(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
