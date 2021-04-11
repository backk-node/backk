"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function IsNoneOf(getPossibleValuesFunc, serviceFunctionName, testValue, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isNoneOf',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isNoneOf', serviceFunctionName, testValue],
            options: validationOptions,
            validator: {
                async validate(value) {
                    const [possibleValues] = await getPossibleValuesFunc();
                    return possibleValues ? !possibleValues.some(({ name }) => value === name) : false;
                },
                defaultMessage: () => propertyName + ' may not be anyone from the result of service function call: ' + serviceFunctionName
            }
        });
    };
}
exports.default = IsNoneOf;
//# sourceMappingURL=IsNoneOf.js.map