import { registerDecorator, ValidationOptions } from "class-validator";

export default function AcceptFileTypes(fileTypes: string[], validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'acceptFileTypes',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['acceptFileTypes', fileTypes],
      options: validationOptions,
      validator: {
        validate() {
          return true;
        }
      }
    });
  };
}
