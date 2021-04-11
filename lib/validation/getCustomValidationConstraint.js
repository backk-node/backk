"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function getCustomValidationConstraint(Class, propertyName, validationType, constraintIndex) {
    const validationMetadatas = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(Class, '');
    const foundValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName &&
        validationMetadata.type === 'customValidation' &&
        validationMetadata.constraints[0] === validationType);
    return foundValidation ? foundValidation.constraints[constraintIndex] : undefined;
}
exports.default = getCustomValidationConstraint;
//# sourceMappingURL=getCustomValidationConstraint.js.map