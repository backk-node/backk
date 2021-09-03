import { registerDecorator, ValidationOptions } from "class-validator";
import isAscii from "validator/lib/isAscii";
import { Lengths } from "../../constants/constants";

export default function IsSubject(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isSubject',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isSubject'],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return value.length < Lengths._256 && isAscii(value);
        }
      },
    });
  };
}
