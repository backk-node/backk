import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import isPostalCode from 'validator/lib/isPostalCode';

export default function IsPostalCode(
  locale: 'any' | ValidatorJS.PostalCodeLocale,
  validationOptions?: ValidationOptions
) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isPostalCode',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isPostalCode', locale],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return isPostalCode(value, args.constraints[1]);
        },
        defaultMessage: () =>
          propertyName + ' is not a valid postal code for locale: ' + locale
      }
    });
  };
}
