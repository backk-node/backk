import { ValidationOptions } from 'class-validator';
export default function IsBigInt(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
