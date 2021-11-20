import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export default function IsTimeBetween(
  startValue: string,
  endValue: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isTimeBetween',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isTimeBetween', startValue, endValue],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const startDate = dayjs(startValue, 'HH:mm');
          const endDate = dayjs(endValue, 'HH:mm');
          return date.isBetween(startDate, endDate, 'minute', '[]')
        },
        defaultMessage: () =>
          propertyName +
          ' must be a timestamp where ' +
          'year and month is between ' +
          startValue +
          ' and ' +
          endValue,
      },
    });
  };
}
