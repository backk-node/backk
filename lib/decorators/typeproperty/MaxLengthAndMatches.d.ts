import { ValidationOptions } from "class-validator";
export default function MaxLengthAndMatches(maxLength: number, regexp: RegExp, validationOptions?: ValidationOptions, isIncludeOrExcludeResponseFieldsProperty?: boolean): (object: Record<string, any>, propertyName: string) => void;
