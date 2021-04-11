"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const re2_1 = __importDefault(require("re2"));
function LengthAndMatchesAll(minLength, maxLength, regExps, errorMessage, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'lengthAndMatchesAll',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['lengthAndMatchesAll', minLength, maxLength, regExps],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (value.length > maxLength || value.length < minLength) {
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
                    ' length must be between ' +
                    minLength +
                    '-' +
                    maxLength +
                    ' and must match all: ' +
                    regExps.map((regExp) => regExp.toString()).join(', ')
            }
        });
    };
}
exports.default = LengthAndMatchesAll;
//# sourceMappingURL=LengthOrMatchesAll.js.map