import serviceFunctionAnnotationContainer from './serviceFunctionAnnotationContainer';
import defaultRetryIntervals from '../../../scheduling/defaultRetryIntervals';

export type Range = {
  start: number;
  end: number;
};

export type CronSchedule = {
  minutes?: number | number[] | Range | 'any';
  minuteInterval?: number;
  hours?: number | number[] | Range | 'any';
  hourInterval?: number;
  daysOfMonth?: number | number[] | Range | 'any';
  dayInterval?: number;

  // 0 - 11
  months?: number | number[] | Range | 'any';
  monthInterval?: number;

  // 0-6 (Sun-Sat)
  daysOfWeek?: number | number[] | Range;
  weekDayInterval?: number;
};

function getCronValuesStr(values: number | number[] | Range | 'any' | undefined): string {
  if (values === undefined || values === 'any') {
    return '*';
  }

  if (typeof values === 'number') {
    return values.toString();
  }

  if (Array.isArray(values)) {
    return values.map((value) => value.toString()).join(',');
  }

  return values.start + '-' + values.end;
}

function getCronIntervalStr(interval: number | undefined): string {
  if (interval === undefined) {
    return '';
  }

  return '/' + interval;
}

export function CronJob(cronSchedule: CronSchedule, retryIntervalsInSecs: number[] = defaultRetryIntervals) {
  const cronScheduleStr = Array(6)
    .fill('')
    .map((defaultCronParameter, index) => {
      // noinspection IfStatementWithTooManyBranchesJS
      if (index === 0) {
        return '0';
      } else if (index === 1) {
        return getCronValuesStr(cronSchedule.minutes) + getCronIntervalStr(cronSchedule.minuteInterval);
      } else if (index === 2) {
        if (
          (cronSchedule.hours !== undefined || cronSchedule.hourInterval !== undefined) &&
          cronSchedule.minutes === undefined
        ) {
          throw new Error('You must specify minutes for schedule');
        }
        return getCronValuesStr(cronSchedule.hours) + getCronIntervalStr(cronSchedule.hourInterval);
      } else if (index === 3) {
        if (
          (cronSchedule.daysOfMonth !== undefined || cronSchedule.dayInterval !== undefined) &&
          (cronSchedule.minutes === undefined || cronSchedule.hours === undefined)
        ) {
          throw new Error('You must specify minutes and hours for schedule');
        }
        return getCronValuesStr(cronSchedule.daysOfMonth) + getCronIntervalStr(cronSchedule.dayInterval);
      } else if (index === 4) {
        if (
          (cronSchedule.months !== undefined || cronSchedule.monthInterval !== undefined) &&
          (cronSchedule.minutes === undefined ||
            cronSchedule.hours === undefined ||
            cronSchedule.daysOfMonth === undefined)
        ) {
          throw new Error('You must specify minutes, hours and daysOfMonth for schedule');
        }
        return getCronValuesStr(cronSchedule.months) + getCronIntervalStr(cronSchedule.monthInterval);
      } else if (index === 5) {
        if (
          (cronSchedule.daysOfWeek !== undefined || cronSchedule.weekDayInterval !== undefined) &&
          (cronSchedule.minutes === undefined || cronSchedule.hours === undefined)
        ) {
          throw new Error('You must specify minutes and hours for schedule');
        }
        return getCronValuesStr(cronSchedule.daysOfWeek) + getCronIntervalStr(cronSchedule.weekDayInterval);
      }

      return defaultCronParameter;
    })
    .join(' ');

  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, functionName: string) {
    const superClassPrototype = Object.getPrototypeOf(object);

    const cronSchedule = serviceFunctionAnnotationContainer.getServiceFunctionNameToCronScheduleMap()[
      `${superClassPrototype.constructor.name.charAt(0).toLowerCase() +
        superClassPrototype.constructor.name.slice(1)}.${functionName}`
    ];

    if (cronSchedule) {
      throw new Error('Only one cron job allowed per service function');
    }

    serviceFunctionAnnotationContainer.addCronScheduleForServiceFunction(
      superClassPrototype.constructor,
      functionName,
      cronScheduleStr
    );

    serviceFunctionAnnotationContainer.addRetryIntervalsInSecsForServiceFunction(
      superClassPrototype.constructor,
      functionName,
      retryIntervalsInSecs
    );

    serviceFunctionAnnotationContainer.addServiceFunctionAllowedForClusterInternalUse(
      object.constructor,
      functionName
    );
  };
}
