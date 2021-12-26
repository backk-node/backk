import { ValidationOptions, registerDecorator } from 'class-validator';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export default function IsTimestampBetween(
  startValue: string,
  endValue: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isTimestampBetween',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isTimestampBetween', startValue, endValue],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const startDate = dayjs(startValue);
          const endDate = dayjs(endValue);
          return date.isBetween(startDate, endDate, 'minute', '[]');
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
