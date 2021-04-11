import { ValidationError } from "class-validator";
export default function getValidationErrors(errorOrValidationErrors: ValidationError[] | Error): string;
