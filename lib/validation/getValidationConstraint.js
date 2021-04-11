"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function getValidationConstraint(Class, propertyName, validationType, constraintIndex) {
    const validationMetadatas = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(Class, '');
    const foundValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName && validationMetadata.type === validationType);
    return foundValidation ? foundValidation.constraints[constraintIndex !== null && constraintIndex !== void 0 ? constraintIndex : 0] : undefined;
}
exports.default = getValidationConstraint;
//# sourceMappingURL=getValidationConstraint.js.map