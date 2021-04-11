"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const shouldEncryptValue_1 = __importDefault(require("../crypt/shouldEncryptValue"));
const encrypt_1 = __importDefault(require("../crypt/encrypt"));
function calculateMaxLength(Class, propertyName, dataLength) {
    if (shouldEncryptValue_1.default(propertyName, Class)) {
        const encryptedValue = encrypt_1.default(Array(dataLength)
            .fill(1)
            .join(''));
        return encryptedValue.length;
    }
    return dataLength;
}
function getMaxLengthValidationConstraint(Class, propertyName) {
    const validationMetadatas = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(Class, '');
    const maxLengthValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName && validationMetadata.type === 'maxLength');
    if (maxLengthValidation) {
        return calculateMaxLength(Class, propertyName, maxLengthValidation.constraints[0]);
    }
    const lengthValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName && validationMetadata.type === 'length');
    if (lengthValidation) {
        return calculateMaxLength(Class, propertyName, lengthValidation.constraints[1]);
    }
    const lengthAndMatchesValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName &&
        validationMetadata.type === 'customValidation' &&
        validationMetadata.constraints[0] === 'lengthAndMatches');
    if (lengthAndMatchesValidation) {
        return calculateMaxLength(Class, propertyName, lengthAndMatchesValidation.constraints[2]);
    }
    const lengthAndMatchesAllValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName &&
        validationMetadata.type === 'customValidation' &&
        validationMetadata.constraints[0] === 'lengthAndMatchesAll');
    if (lengthAndMatchesAllValidation) {
        return calculateMaxLength(Class, propertyName, lengthAndMatchesAllValidation.constraints[2]);
    }
    const maxLengthAndMatchesValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName &&
        validationMetadata.type === 'customValidation' &&
        validationMetadata.constraints[0] === 'maxLengthAndMatches');
    if (maxLengthAndMatchesValidation) {
        return calculateMaxLength(Class, propertyName, maxLengthAndMatchesValidation.constraints[1]);
    }
    const maxLengthAndMatchesAllValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName &&
        validationMetadata.type === 'customValidation' &&
        validationMetadata.constraints[0] === 'maxLengthAndMatchesAll');
    if (maxLengthAndMatchesAllValidation) {
        return calculateMaxLength(Class, propertyName, maxLengthAndMatchesAllValidation.constraints[1]);
    }
    const strongPasswordValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName &&
        validationMetadata.type === 'customValidation' &&
        validationMetadata.constraints[0] === 'isStrongPassword');
    if (strongPasswordValidation) {
        return calculateMaxLength(Class, propertyName, 512);
    }
    throw new Error("Cannot figure out string property's maximum length");
}
exports.default = getMaxLengthValidationConstraint;
//# sourceMappingURL=getMaxLengthValidationConstraint.js.map