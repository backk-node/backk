import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

export default function IsAnyString(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isAnyString',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isAnyString'],
      options: validationOptions,
      validator: {
        validate() {
          return true;
        }
      },
    });
  };
}
