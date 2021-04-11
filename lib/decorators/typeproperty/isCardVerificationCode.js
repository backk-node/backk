"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const dayjs_1 = __importDefault(require("dayjs"));
const isSameOrAfter_1 = __importDefault(require("dayjs/plugin/isSameOrAfter"));
dayjs_1.default.extend(isSameOrAfter_1.default);
function IsCardVerificationCode(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isCardVerificationCode',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isCardVerificationCode'],
            options: validationOptions,
            validator: {
                validate(value) {
                    return !!value.match(/^[0-9]{3,4}$/);
                },
                defaultMessage: () => propertyName + ' is not a valid credit card verification code'
            }
        });
    };
}
exports.default = IsCardVerificationCode;
//# sourceMappingURL=isCardVerificationCode.js.map