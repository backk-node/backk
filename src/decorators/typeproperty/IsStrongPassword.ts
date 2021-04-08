import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import RE2 from "re2";
import hasAtMostRepeatingOrConsecutiveCharacters
  from "../../validation/hasAtMostRepeatingOrConsecutiveCharacters";
import { Lengths } from "../../constants/constants";

export default function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isStrongPassword'],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          if (value.length > Lengths._512 || value.length < 8) {
            return false;
          }

          for (const regExp of [/[a-z]+/, /[A-Z]+/, /\d+/, /[^\w\s]+/]) {
            const re2RegExp = new RE2(regExp);
            const doesMatch = re2RegExp.test(value);
            if (!doesMatch) {
              return false;
            }
          }

          if (value.toLowerCase().includes('password')) {
            return false;
          }

          const obj = args.object as any;

          if (value.toLowerCase().includes(obj?.userName?.toLowerCase())) {
            return false;
          }

          return hasAtMostRepeatingOrConsecutiveCharacters(value, 3);
        },
        defaultMessage: () =>
          propertyName +
          ' is not a strong password: Password should be 8 - 512 characters long and should contain at least one lowercase letter, at least one uppercase letter, at least one digit and at least one special character. Password may not contain word "password" and may not contain userName. Password cannot have more than 3 alphabetically consecutive letters or numerically consecutive digits (e.g. abcd and 1234 are prohibited). Password may not contain more than 3 repeating characters (e.g. 1111 and aaaa are prohibited). Password may not contain more than 4 keyboard layout consecutive characters, e.g. qwert and asdf are prohibited'
      }
    });
  };
}
