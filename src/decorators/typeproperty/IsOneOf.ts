import { registerDecorator, ValidationOptions } from 'class-validator';
import { Value } from '../../types/Value';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import { Many } from "../../datastore/DataStore";

export default function IsOneOf(
  getPossibleValuesFunc: () => PromiseErrorOr<Many<Value>>,
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
            ? possibleValues.data.some((possibleValue) => value === possibleValue.value)
            : false;
        },
        defaultMessage: () =>
          propertyName + ' must be one from the result of service function call: ' + serviceFunctionName
      }
    });
  };
}
