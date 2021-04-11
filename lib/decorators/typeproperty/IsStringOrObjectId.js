"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
function IsStringOrObjectId(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isStringOrObjectId',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isStringOrObjectId'],
            options: validationOptions,
            validator: {
                validate(value) {
                    var _a;
                    return typeof value === 'string' || ((_a = value === null || value === void 0 ? void 0 : value.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'ObjectID';
                },
                defaultMessage: () => propertyName + ' must be a string or MongoDB ObjectId'
            },
        });
    };
}
exports.default = IsStringOrObjectId;
//# sourceMappingURL=IsStringOrObjectId.js.map