import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function ShouldBeTrueFor<T>(
  func: (entity: T) => boolean,
  errorMessage?: string,
  validationOptions?: ValidationOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'shouldBeTrueForEntity',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['shouldBeTrueForEntity', func],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return func(args.object as any);
        },
        defaultMessage: () =>
          errorMessage ? errorMessage : 'BackkEntity did not match predicate: ' + func.toString()
      }
    });
  };
}
