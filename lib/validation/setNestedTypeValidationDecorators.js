"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const ValidationMetadata_1 = require("class-validator/metadata/ValidationMetadata");
const class_transformer_1 = require("class-transformer");
const entityAnnotationContainer_1 = __importDefault(require("../decorators/entity/entityAnnotationContainer"));
function setNestedTypeValidationDecorators(Class) {
    const validationMetadatas = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(Class, '');
    validationMetadatas.forEach((validationMetadata) => {
        if (validationMetadata.type === 'isDate') {
            class_transformer_1.Type(() => Date)(new validationMetadata.target(), validationMetadata.propertyName);
        }
        if (validationMetadata.type === 'isInstance') {
            if (entityAnnotationContainer_1.default.entityNameToClassMap[Class.name] &&
                !entityAnnotationContainer_1.default.entityNameToClassMap[validationMetadata.constraints[0].name]) {
                throw new Error(validationMetadata.constraints[0].name + ' is missing @BackkEntity() annotation');
            }
            const nestedValidationMetadataArgs = {
                type: class_validator_1.ValidationTypes.NESTED_VALIDATION,
                target: validationMetadata.target,
                propertyName: validationMetadata.propertyName,
                validationOptions: { each: validationMetadata.each }
            };
            class_transformer_1.Type(() => validationMetadata.constraints[0])(new validationMetadata.target(), validationMetadata.propertyName);
            class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(new ValidationMetadata_1.ValidationMetadata(nestedValidationMetadataArgs));
        }
    });
}
exports.default = setNestedTypeValidationDecorators;
//# sourceMappingURL=setNestedTypeValidationDecorators.js.map