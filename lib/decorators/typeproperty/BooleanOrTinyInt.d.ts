import { ValidationOptions } from 'class-validator';
export default function BooleanOrTinyInt(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
