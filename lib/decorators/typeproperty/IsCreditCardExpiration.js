"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const dayjs_1 = __importDefault(require("dayjs"));
const isSameOrAfter_1 = __importDefault(require("dayjs/plugin/isSameOrAfter"));
dayjs_1.default.extend(isSameOrAfter_1.default);
function IsCreditCardExpiration(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isCreditCardExpiration',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['isCreditCardExpiration'],
            options: validationOptions,
            validator: {
                validate(value) {
                    const [month, year] = value.split('/');
                    const currentTimestamp = dayjs_1.default()
                        .set('day', 1)
                        .set('hour', 0)
                        .set('minute', 0)
                        .set('second', 0)
                        .set('millisecond', 0);
                    const century = Math.floor(currentTimestamp.get('year') / 100);
                    const expirationTimestamp = dayjs_1.default(`${year.length === 4 ? year : century + year}-${month}-01T00:00:00`);
                    return (!!value.match(/^(0[1-9]|1[0-2])\/([0-9]{2}|[2-9][0-9]{3})$/) &&
                        expirationTimestamp.isSameOrAfter(currentTimestamp));
                },
                defaultMessage: () => propertyName + ' is not a valid credit card expiration'
            }
        });
    };
}
exports.default = IsCreditCardExpiration;
//# sourceMappingURL=IsCreditCardExpiration.js.map