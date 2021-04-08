import { registerDecorator, ValidationOptions } from "class-validator";
import RE2 from "re2";

export default function MaxLengthAndMatches(
  maxLength: number,
  regexp: RegExp,
  validationOptions?: ValidationOptions,
  isIncludeOrExcludeResponseFieldsProperty = false
) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'maxLengthAndMatches',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['maxLengthAndMatches', maxLength, regexp],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (isIncludeOrExcludeResponseFieldsProperty && value.includes('{')) {
            // noinspection AssignmentToFunctionParameterJS
            maxLength = 65536
          }

          if (value.length > maxLength) {
            return false;
          }

          const re2RegExp = new RE2(regexp);
          return re2RegExp.test(value);
        },
        defaultMessage: () =>
          propertyName + ' length must be ' + maxLength + ' or less and must match ' + regexp
      }
    });
  };
}
