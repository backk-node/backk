import { registerDecorator, ValidationOptions } from 'class-validator';
import isDataUri from 'validator/lib/isDataURI';

export default function IsDataUri(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isDataUri',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isDataUri'],
      options: validationOptions,
      validator: {
        validate(value: any) {
          // TODO: support validationOption each:true
          return isDataUri(value);
        },
        defaultMessage: () =>
          propertyName + ' is not a valid data URI'
      }
    });
  };
}
