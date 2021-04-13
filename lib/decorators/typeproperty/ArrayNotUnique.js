"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function ArrayNotUnique(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'arrayNotUnique',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['arrayNotUnique'],
            options: validationOptions,
            validator: {
                validate() {
                    return true;
                }
            }
        });
    };
}
exports.default = ArrayNotUnique;
//# sourceMappingURL=ArrayNotUnique.js.map