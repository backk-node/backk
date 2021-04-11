"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const re2_1 = __importDefault(require("re2"));
function MaxLengthAndMatches(maxLength, regexp, validationOptions, isIncludeOrExcludeResponseFieldsProperty = false) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'maxLengthAndMatches',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['maxLengthAndMatches', maxLength, regexp],
            options: validationOptions,
            validator: {
                validate(value) {
                    if (isIncludeOrExcludeResponseFieldsProperty && value.includes('{')) {
                        maxLength = 65536;
                    }
                    if (value.length > maxLength) {
                        return false;
                    }
                    const re2RegExp = new re2_1.default(regexp);
                    return re2RegExp.test(value);
                },
                defaultMessage: () => propertyName + ' length must be ' + maxLength + ' or less and must match ' + regexp
            }
        });
    };
}
exports.default = MaxLengthAndMatches;
//# sourceMappingURL=MaxLengthAndMatches.js.map