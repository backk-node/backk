import { ValidationOptions } from 'class-validator';
export default function IsDataUri(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
