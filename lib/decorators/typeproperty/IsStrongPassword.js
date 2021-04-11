"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const re2_1 = __importDefault(require("re2"));
const hasAtMostRepeatingOrConsecutiveCharacters_1 = __importDefault(require("../../validation/hasAtMostRepeatingOrConsecutiveCharacters"));
const constants_1 = require("../../constants/constants");
function IsStrongPassword(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isStrongPassword'],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    var _a;
                    if (typeof value !== 'string') {
                        return false;
                    }
                    if (value.length > constants_1.Lengths._512 || value.length < 8) {
                        return false;
                    }
                    for (const regExp of [/[a-z]+/, /[A-Z]+/, /\d+/, /[^\w\s]+/]) {
                        const re2RegExp = new re2_1.default(regExp);
                        const doesMatch = re2RegExp.test(value);
                        if (!doesMatch) {
                            return false;
                        }
                    }
                    if (value.toLowerCase().includes('password')) {
                        return false;
                    }
                    const obj = args.object;
                    if (value.toLowerCase().includes((_a = obj === null || obj === void 0 ? void 0 : obj.userName) === null || _a === void 0 ? void 0 : _a.toLowerCase())) {
                        return false;
                    }
                    return hasAtMostRepeatingOrConsecutiveCharacters_1.default(value, 3);
                },
                defaultMessage: () => propertyName +
                    ' is not a strong password: Password should be 8 - 512 characters long and should contain at least one lowercase letter, at least one uppercase letter, at least one digit and at least one special character. Password may not contain word "password" and may not contain userName. Password cannot have more than 3 alphabetically consecutive letters or numerically consecutive digits (e.g. abcd and 1234 are prohibited). Password may not contain more than 3 repeating characters (e.g. 1111 and aaaa are prohibited). Password may not contain more than 4 keyboard layout consecutive characters, e.g. qwert and asdf are prohibited'
            }
        });
    };
}
exports.default = IsStrongPassword;
//# sourceMappingURL=IsStrongPassword.js.map