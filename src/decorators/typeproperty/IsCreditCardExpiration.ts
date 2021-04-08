import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

export default function IsCreditCardExpiration(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isCreditCardExpiration',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isCreditCardExpiration'],
      options: validationOptions,
      validator: {
        validate(value: string) {
          const [month, year] = value.split('/');

          const currentTimestamp = dayjs()
            .set('day', 1)
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('millisecond', 0);

          const century = Math.floor(currentTimestamp.get('year') / 100);

          const expirationTimestamp = dayjs(
            `${year.length === 4 ? year : century + year}-${month}-01T00:00:00`
          );

          return (
            !!value.match(/^(0[1-9]|1[0-2])\/([0-9]{2}|[2-9][0-9]{3})$/) &&
            expirationTimestamp.isSameOrAfter(currentTimestamp)
          );
        },
        defaultMessage: () => propertyName + ' is not a valid credit card expiration'
      }
    });
  };
}
