import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export default function IsUndefined(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isUndefined',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isUndefined'],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // TODO: support validationOption each:true
          return value === undefined;
        },
        defaultMessage: () => propertyName + ' is not allowed'
      },
    });
  };
}
