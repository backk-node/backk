import { ValidationOptions, registerDecorator } from "class-validator";

export default function ArrayNotUnique(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'arrayNotUnique',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['arrayNotUnique'],
      options: validationOptions,
      validator: {
        validate() {
          return true;
        }
      }
    });
  };
}
