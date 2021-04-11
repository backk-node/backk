export declare type Range = {
    start: number;
    end: number;
};
export declare type CronSchedule = {
    minutes?: number | number[] | Range | 'any';
    minuteInterval?: number;
    hours?: number | number[] | Range | 'any';
    hourInterval?: number;
    daysOfMonth?: number | number[] | Range | 'any';
    dayInterval?: number;
    months?: number | number[] | Range | 'any';
    monthInterval?: number;
    daysOfWeek?: number | number[] | Range;
    weekDayInterval?: number;
};
export declare function CronJob(cronSchedule: CronSchedule, retryIntervalsInSecs?: number[]): (object: Object, functionName: string) => void;
