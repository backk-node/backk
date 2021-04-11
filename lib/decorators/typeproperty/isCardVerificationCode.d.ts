import { ValidationOptions } from 'class-validator';
export default function IsCardVerificationCode(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
