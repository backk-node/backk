"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function IsUndefined(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isUndefined',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isUndefined'],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return value === undefined;
                },
                defaultMessage: () => propertyName + ' is not allowed'
            },
        });
    };
}
exports.default = IsUndefined;
//# sourceMappingURL=IsUndefined.js.map