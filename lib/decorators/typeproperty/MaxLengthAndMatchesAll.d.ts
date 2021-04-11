import { ValidationOptions } from 'class-validator';
export default function MaxLengthAndMatchesAll(maxLength: number, regExps: RegExp[], errorMessage?: string, validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
