"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getValidationErrors(errorOrValidationErrors) {
    return errorOrValidationErrors instanceof Error
        ? errorOrValidationErrors.message
        : errorOrValidationErrors
            .map((validationError) => {
            if (validationError.constraints) {
                return Object.values(validationError.constraints)
                    .map((constraint) => constraint)
                    .join(', ');
            }
            else {
                return validationError.property + ': ' + getValidationErrors(validationError.children);
            }
        })
            .join(', ');
}
exports.default = getValidationErrors;
//# sourceMappingURL=getValidationErrors.js.map