"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function IsOneOf(getPossibleValuesFunc, serviceFunctionName, testValue, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isOneOf',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isOneOf', serviceFunctionName, testValue],
            options: validationOptions,
            validator: {
                async validate(value) {
                    const [possibleValues] = await getPossibleValuesFunc();
                    return possibleValues
                        ? possibleValues.some((possibleValue) => value === possibleValue.name)
                        : false;
                },
                defaultMessage: () => propertyName + ' must be one from the result of service function call: ' + serviceFunctionName
            }
        });
    };
}
exports.default = IsOneOf;
//# sourceMappingURL=IsOneOf.js.map