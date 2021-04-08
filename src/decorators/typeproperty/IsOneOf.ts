import { registerDecorator, ValidationOptions } from 'class-validator';
import { Name } from '../../types/Name';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';

export default function IsOneOf(
  getPossibleValuesFunc: () => PromiseErrorOr<Name[]>,
  serviceFunctionName: string,
  testValue: string,
  validationOptions?: ValidationOptions
) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isOneOf',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isOneOf', serviceFunctionName, testValue],
      options: validationOptions,
      validator: {
        async validate(value: any) {
          const [possibleValues] = await getPossibleValuesFunc();

          return possibleValues
            ? possibleValues.some((possibleValue) => value === possibleValue.name)
            : false;
        },
        defaultMessage: () =>
          propertyName + ' must be one from the result of service function call: ' + serviceFunctionName
      }
    });
  };
}
