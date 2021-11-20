import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';

enum DayOfWeek {
  Sunday = 0,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

export default function IsDayOfWeekBetween(
  startValue: DayOfWeek,
  endValue: DayOfWeek,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isDayOfWeekBetween',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isDayOfWeekBetween', startValue, endValue],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const weekDay = dayjs(value).day();
          return weekDay >= startValue && weekDay <= endValue;
        },
        defaultMessage: () =>
          propertyName +
          ' must be a timestamp where week day is between ' +
          DayOfWeek[startValue] +
          ' and ' +
          DayOfWeek[endValue],
      },
    });
  };
}
