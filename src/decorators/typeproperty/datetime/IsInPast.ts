import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';

export default function IsInPast(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isInPast',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isInPast'],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return dayjs(value).isBefore(dayjs());
        },
        defaultMessage: () => propertyName + ' must be a timestamp in the past',
      },
    });
  };
}
