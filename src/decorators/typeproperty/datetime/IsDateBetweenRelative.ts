import { ValidationOptions, registerDecorator } from 'class-validator';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export default function IsDateBetweenRelative(
  startValueSubtractAmount: number,
  startValueSubtractUnit: dayjs.UnitType,
  endValueAddAmount: number,
  endValueAddUnit: dayjs.UnitType,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isDateBetweenRelative',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [
        'isDateBetweenRelative',
        startValueSubtractAmount,
        startValueSubtractUnit,
        endValueAddAmount,
        endValueAddUnit,
      ],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = dayjs(value);
          const startDate = dayjs().subtract(startValueSubtractAmount, startValueSubtractUnit);
          const endDate = dayjs().add(endValueAddAmount, endValueAddUnit);
          return date.isBetween(startDate, endDate, 'date', '[]');
        },
        defaultMessage: () =>
          propertyName +
          ' must be a timestamp where ' +
          'date is between ' +
          dayjs().subtract(startValueSubtractAmount, startValueSubtractUnit).format('YYYY-MM-DD') +
          ' and ' +
          dayjs().add(endValueAddAmount, endValueAddUnit).format('YYYY-MM-DD'),
      },
    });
  };
}
