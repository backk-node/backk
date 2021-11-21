import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';

export default function IsMinuteIn(values: number[], validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isMinuteIn',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isMinuteIn', values],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const minute = date.minute();
          return values.includes(minute);
        },
        defaultMessage: () =>
          propertyName + ' must have minute: ' + values.join(', '),
      },
    });
  };
}
