
import { registerDecorator, ValidationOptions } from "class-validator";
import dayjs from "dayjs";

export default function IsInFuture(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isInFuture',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isInFuture'],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return dayjs(value).isAfter(dayjs());
        }
      }
    });
  };
}
