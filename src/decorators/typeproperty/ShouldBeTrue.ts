import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export default function ShouldBeTrue(
  validateValue: (value: any) => boolean,
  errorMessage?: string,
  validationOptions?: ValidationOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'shouldBeTrue',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['shouldBeTrue', validateValue],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return validateValue(value);
        },
        defaultMessage: () =>
          errorMessage ? errorMessage : 'Property did not match predicate: ' + validateValue.toString()
      }
    });
  };
}
