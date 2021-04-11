import { ValidationOptions } from 'class-validator';
export default function IsCreditCardExpiration(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
