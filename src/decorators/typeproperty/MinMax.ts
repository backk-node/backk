import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export default function MinMax(
  minValue: number,
  maxValue: number,
  validationOptions?: ValidationOptions
) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'minMax',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['minMax', minValue, maxValue],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // TODO implement array support
          if (value > maxValue || value < minValue) {
            return false;
          }
          return true;
        },
        defaultMessage: () =>
          propertyName + ' value must be between ' + minValue + ' - ' + maxValue
      }
    });
  };
}
