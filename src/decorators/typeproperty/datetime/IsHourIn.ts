import { ValidationOptions, registerDecorator } from 'class-validator';
import dayjs from 'dayjs';

export default function IsHourIn(values: number[], validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isHourIn',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isHourIn', values],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const hour = date.hour();
          return values.includes(hour);
        },
        defaultMessage: () =>
          propertyName + ' must have hour: ' + values.join(', '),
      },
    });
  };
}
