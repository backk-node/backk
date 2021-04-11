"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function BooleanOrTinyInt(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isBooleanOrTinyInt',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isBooleanOrTinyInt'],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return typeof value === 'boolean' || value === 0 || value === 1;
                },
                defaultMessage: () => propertyName + ' must be a boolean value'
            },
        });
    };
}
exports.default = BooleanOrTinyInt;
//# sourceMappingURL=BooleanOrTinyInt.js.map