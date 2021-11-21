import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';

export default function IsMonthIn(values: number[], validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isMonthIn',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isMonthIn', values],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const month = date.month() + 1;
          return values.includes(month);
        },
        defaultMessage: () =>
          propertyName + ' must have month: ' + values.join(', '),
      },
    });
  };
}
