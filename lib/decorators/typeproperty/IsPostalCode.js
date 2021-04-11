"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const isPostalCode_1 = __importDefault(require("validator/lib/isPostalCode"));
function IsPostalCode(locale, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isPostalCode',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isPostalCode', locale],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return isPostalCode_1.default(value, args.constraints[1]);
                },
                defaultMessage: () => propertyName + ' is not a valid postal code for locale: ' + locale
            }
        });
    };
}
exports.default = IsPostalCode;
//# sourceMappingURL=IsPostalCode.js.map