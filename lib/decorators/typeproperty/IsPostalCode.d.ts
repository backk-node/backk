/// <reference types="validator" />
import { ValidationOptions } from 'class-validator';
export default function IsPostalCode(locale: 'any' | ValidatorJS.PostalCodeLocale, validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
