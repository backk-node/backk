"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function IsAnyString(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isAnyString',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isAnyString'],
            options: validationOptions,
            validator: {
                validate() {
                    return true;
                }
            },
        });
    };
}
exports.default = IsAnyString;
//# sourceMappingURL=IsAnyString.js.map