import { ValidationOptions, registerDecorator } from 'class-validator';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export default function IsYearAndMonthBetween(
  startValue: string,
  endValue: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isYearAndMonthBetween',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isYearAndMonthBetween', startValue, endValue],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const startDate = dayjs(startValue, 'YYYY-MM');
          const endDate = dayjs(endValue, 'YYYY-MM');
          return date.isBetween(startDate, endDate, 'month', '[]');
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
