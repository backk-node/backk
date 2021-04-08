import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export default function IsStringOrObjectId(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isStringOrObjectId',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isStringOrObjectId'],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' || value?.constructor?.name === 'ObjectID';
        },
        defaultMessage: () => propertyName + ' must be a string or MongoDB ObjectId'
      },
    });
  };
}
