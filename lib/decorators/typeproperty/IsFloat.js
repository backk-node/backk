"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const ValidationMetadata_1 = require("class-validator/metadata/ValidationMetadata");
function IsFloat(maxDecimalPlaces, options) {
    return function (object, propertyName) {
        const validationMetadataArgs = {
            type: class_validator_1.ValidationTypes.IS_NUMBER,
            target: object.constructor,
            propertyName,
            constraints: [{ maxDecimalPlaces }],
            validationOptions: { each: options === null || options === void 0 ? void 0 : options.each }
        };
        const validationMetadata = new ValidationMetadata_1.ValidationMetadata(validationMetadataArgs);
        class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(validationMetadata);
    };
}
exports.default = IsFloat;
//# sourceMappingURL=IsFloat.js.map