import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

export default function IsBigInt(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isBigInt',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isBigInt'],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && Number.isInteger(value);
        },
        defaultMessage: () => propertyName + ' must be an integer number'
      },
    });
  };
}
