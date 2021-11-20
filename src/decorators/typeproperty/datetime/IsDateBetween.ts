import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export default function IsDateBetween(
  startValue: string,
  endValue: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isDateBetween',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isDateBetween', startValue, endValue],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const startDate = dayjs(startValue, 'YYYY-MM-DD');
          const endDate = dayjs(endValue, 'YYYY-MM-DD');
          return date.isBetween(startDate, endDate, 'date', '[]');
        },
        defaultMessage: () =>
          propertyName +
          ' must be a timestamp where ' +
          'date is between ' +
          startValue +
          ' and ' +
          endValue,
      },
    });
  };
}
