import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';

export default function IsDayOfMonthIn(values: number[], validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isDayOfMonthIn',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isDayOfMonthIn', values],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const day = date.date();
          return values.includes(day);
        },
        defaultMessage: () =>
          propertyName + ' must have day of month: ' + values.join(', '),
      },
    });
  };
}
