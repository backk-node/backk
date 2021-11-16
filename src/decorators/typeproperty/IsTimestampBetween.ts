import { registerDecorator, ValidationOptions } from "class-validator";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isBetween)
dayjs.extend(isoWeek)

export type Unit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'isoDayOfWeek'

export default function IsTimestampBetween(unit: Unit, startValue: number, endValue: number, validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isTimestampBetween',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isTimestampBetween', unit, startValue, endValue],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          if (unit === 'isoDayOfWeek') {
            const dayOfWeek = date.isoWeekday();
            return dayOfWeek >= startValue && dayOfWeek <= endValue
          }

          return date.isBetween(startValue, endValue, unit);
        }
      }
    });
  };
}
