import { ValidationOptions, registerDecorator } from 'class-validator';

export default function IsCreditCardVerificationCode(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isCardVerificationCode',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isCardVerificationCode'],
      options: validationOptions,
      validator: {
        validate(value: string) {
          if (typeof value !== 'string') {
            return false;
          }

          return !!value.match(/^[0-9]{3,4}$/);
        },
        defaultMessage: () =>
          propertyName + ' is not a valid credit card verification code'
      }
    });
  };
}
