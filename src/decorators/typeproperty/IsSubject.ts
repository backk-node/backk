import { registerDecorator, ValidationOptions } from "class-validator";

export default function IsSubject(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isSubject',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isSubject'],
      options: validationOptions,
      validator: {
        validate() {
          return true;
        }
      },
    });
  };
}
