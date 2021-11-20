import { registerDecorator, ValidationOptions } from 'class-validator';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export default function IsTimestampBetweenRelative(
  startValueSubtractAmount: number,
  startValueSubtractUnit: dayjs.UnitType,
  endValueAddAmount: number,
  endValueAddUnit: dayjs.UnitType,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isTimestampBetweenRelative',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [
        'isTimestampBetweenRelative',
        startValueSubtractUnit,
        startValueSubtractUnit,
        endValueAddUnit,
        endValueAddAmount,
      ],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const startDate = dayjs().subtract(startValueSubtractAmount, startValueSubtractUnit);
          const endDate = dayjs().add(endValueAddAmount, endValueAddUnit);
          return date.isBetween(startDate, endDate, 'minute', '[]');
        },
        defaultMessage: () =>
          propertyName +
          ' must be a timestamp where ' +
          'year and month is between ' +
          dayjs().subtract(startValueSubtractAmount, startValueSubtractUnit) +
          ' and ' +
          dayjs().add(endValueAddAmount, endValueAddUnit),
      },
    });
  };
}
