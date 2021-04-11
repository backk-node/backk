import { ValidationOptions } from "class-validator";
export default function ArrayNotUnique(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
