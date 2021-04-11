"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function IsBigInt(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isBigInt',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isBigInt'],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return typeof value === 'number' && Number.isInteger(value);
                },
                defaultMessage: () => propertyName + ' must be an integer number'
            },
        });
    };
}
exports.default = IsBigInt;
//# sourceMappingURL=IsBigInt.js.map