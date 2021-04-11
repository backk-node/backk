import { ValidationOptions } from 'class-validator';
export default function IsStringOrObjectId(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
