import { ValidationOptions } from 'class-validator';
export default function LengthAndMatches(minLength: number, maxLength: number, regexp: RegExp, validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
