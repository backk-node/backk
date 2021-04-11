"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function MinMax(minValue, maxValue, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'minMax',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['minMax', minValue, maxValue],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (value > maxValue || value < minValue) {
                        return false;
                    }
                    return true;
                },
                defaultMessage: () => propertyName + ' value must be between ' + minValue + ' - ' + maxValue
            }
        });
    };
}
exports.default = MinMax;
//# sourceMappingURL=MinMax.js.map