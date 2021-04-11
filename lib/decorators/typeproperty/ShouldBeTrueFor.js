"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShouldBeTrueFor = void 0;
const class_validator_1 = require("class-validator");
function ShouldBeTrueFor(func, errorMessage, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'shouldBeTrueForEntity',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['shouldBeTrueForEntity', func],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return func(args.object);
                },
                defaultMessage: () => errorMessage ? errorMessage : 'BackkEntity did not match predicate: ' + func.toString()
            }
        });
    };
}
exports.ShouldBeTrueFor = ShouldBeTrueFor;
//# sourceMappingURL=ShouldBeTrueFor.js.map