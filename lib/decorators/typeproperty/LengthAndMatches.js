"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const re2_1 = __importDefault(require("re2"));
function LengthAndMatches(minLength, maxLength, regexp, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'lengthAndMatches',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['lengthAndMatches', minLength, maxLength, regexp],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (value.length > maxLength || value.length < minLength) {
                        return false;
                    }
                    const re2RegExp = new re2_1.default(regexp);
                    return re2RegExp.test(value);
                },
                defaultMessage: () => propertyName + ' length must be between' + minLength + '-' + maxLength + ' and must match ' + regexp
            }
        });
    };
}
exports.default = LengthAndMatches;
//# sourceMappingURL=LengthAndMatches.js.map