import { ValidationError } from "class-validator";

export default function getValidationErrors(errorOrValidationErrors: ValidationError[] | Error): string {
  return errorOrValidationErrors instanceof Error
    ? errorOrValidationErrors.message
    : errorOrValidationErrors
      .map((validationError: ValidationError) => {
        if (validationError.constraints) {
          return Object.values(validationError.constraints)
            .map((constraint) => constraint)
            .join(', ');
        } else {
          return validationError.property + ': ' + getValidationErrors(validationError.children);
        }
      })
      .join(', ');
}
