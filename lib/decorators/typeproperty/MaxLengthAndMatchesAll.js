"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const re2_1 = __importDefault(require("re2"));
function MaxLengthAndMatchesAll(maxLength, regExps, errorMessage, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'maxLengthAndMatchesAll',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['maxLengthAndMatchesAll', maxLength, regExps],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (value.length > maxLength) {
                        return false;
                    }
                    for (const regExp of regExps) {
                        const re2RegExp = new re2_1.default(regExp);
                        const doesMatch = re2RegExp.test(value);
                        if (!doesMatch) {
                            return false;
                        }
                    }
                    return true;
                },
                defaultMessage: () => errorMessage !== null && errorMessage !== void 0 ? errorMessage : propertyName +
                    ' length must be ' +
                    maxLength +
                    ' or less and must match all: ' +
                    regExps.map((regExp) => regExp.toString()).join(', ')
            }
        });
    };
}
exports.default = MaxLengthAndMatchesAll;
//# sourceMappingURL=MaxLengthAndMatchesAll.js.map