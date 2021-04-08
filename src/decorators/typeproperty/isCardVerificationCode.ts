import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

export default function IsCardVerificationCode(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isCardVerificationCode',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isCardVerificationCode'],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return !!value.match(/^[0-9]{3,4}$/);
        },
        defaultMessage: () =>
          propertyName + ' is not a valid credit card verification code'
      }
    });
  };
}
