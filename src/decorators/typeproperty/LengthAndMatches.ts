import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import RE2 from 're2';

export default function LengthAndMatches(
  minLength: number,
  maxLength: number,
  regexp: RegExp,
  validationOptions?: ValidationOptions
) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'lengthAndMatches',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['lengthAndMatches', minLength, maxLength, regexp],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // TODO implement array support
          if (value.length > maxLength || value.length < minLength) {
            return false;
          }
          const re2RegExp = new RE2(regexp);
          return re2RegExp.test(value);
        },
        defaultMessage: () =>
          propertyName + ' length must be between' + minLength + '-' + maxLength + ' and must match ' + regexp
      }
    });
  };
}
