import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

export default function ShouldBeTrueForObject<T>(
  validateObject: (object: T) => boolean,
  errorMessage?: string,
  validationOptions?: ValidationOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'shouldBeTrueForObject',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['shouldBeTrueForObject', validateObject],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return validateObject(args.object as any);
        },
        defaultMessage: () =>
          errorMessage ? errorMessage : 'Object did not match predicate: ' + validateObject.toString()
      }
    });
  };
}
