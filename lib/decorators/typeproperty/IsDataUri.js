"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const isDataURI_1 = __importDefault(require("validator/lib/isDataURI"));
function IsDataUri(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isDataUri',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isDataUri'],
            options: validationOptions,
            validator: {
                validate(value) {
                    return isDataURI_1.default(value);
                },
                defaultMessage: () => propertyName + ' is not a valid data URI'
            }
        });
    };
}
exports.default = IsDataUri;
//# sourceMappingURL=IsDataUri.js.map