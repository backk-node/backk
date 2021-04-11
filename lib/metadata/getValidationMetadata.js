"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function getValidationMetadata(Class) {
    const metadataForValidations = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(Class, '');
    const propNameToValidationsMap = {};
    metadataForValidations.forEach((validationMetadata) => {
        const validationType = validationMetadata.type === 'customValidation'
            ? validationMetadata.constraints[0]
            : validationMetadata.type;
        if (validationMetadata.type !== 'conditionalValidation' &&
            validationMetadata.type !== 'nestedValidation' &&
            validationMetadata.type !== 'isInstance' &&
            validationType !== 'isUndefined') {
            const validationConstraints = validationMetadata.type === 'customValidation'
                ? validationMetadata.constraints.slice(1)
                : validationMetadata.constraints;
            const validationConstraintsStr = (validationConstraints !== null && validationConstraints !== void 0 ? validationConstraints : [])
                .map((validationConstraint) => typeof validationMetadata.constraints[0] === 'object' && !(validationConstraint instanceof RegExp)
                ? JSON.stringify(validationConstraint)
                : validationConstraint)
                .join(', ');
            const separator = validationConstraintsStr ? ', ' : '';
            const validationOptionsStr = validationMetadata.each ? separator + '{ each: true }' : '';
            const validationExpr = `${validationType}${'(' +
                validationConstraintsStr +
                validationOptionsStr +
                ')'}`;
            if (!propNameToValidationsMap[validationMetadata.propertyName]) {
                propNameToValidationsMap[validationMetadata.propertyName] = [validationExpr];
            }
            if (!propNameToValidationsMap[validationMetadata.propertyName].includes(validationExpr)) {
                propNameToValidationsMap[validationMetadata.propertyName].push(validationExpr);
            }
        }
    });
    return Object.entries(propNameToValidationsMap).reduce((accumulatedValidationMetadata, [propName, validations]) => {
        return {
            ...accumulatedValidationMetadata,
            [propName]: validations
        };
    }, {});
}
exports.default = getValidationMetadata;
//# sourceMappingURL=getValidationMetadata.js.map