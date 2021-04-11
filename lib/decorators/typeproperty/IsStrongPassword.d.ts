import { ValidationOptions } from "class-validator";
export default function IsStrongPassword(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
