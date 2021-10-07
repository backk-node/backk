import { registerDecorator, ValidationOptions } from "class-validator";
import { Value } from "../../types/Value";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import { Many } from "../../datastore/AbstractDataStore";

export default function IsNoneOf(
  getPossibleValuesFunc: () => PromiseErrorOr<Many<Value>>,
  serviceFunctionName: string,
  testValue: string,
  validationOptions?: ValidationOptions
) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isNoneOf',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isNoneOf', serviceFunctionName, testValue],
      options: validationOptions,
      validator: {
        async validate(value: any) {
          const [possibleValues] = await getPossibleValuesFunc();
          return possibleValues ? !possibleValues.data.some(({ value }) => value === value) : false;
        },
        defaultMessage: () =>
          propertyName + ' may not be anyone from the result of service function call: ' + serviceFunctionName
      }
    });
  };
}
