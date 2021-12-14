## Special Service Function Types

- [Startup Tasks](#startuptasks)
- [Cron Jobs](#cronjobs)

### <a name="startuptasks"></a> Startup Tasks
In your service, you can specify a service functions that are startup tasks. Startup tasks are service functions
that are executed once upon microservice startup, and they cannot be executed by any clients. 

To mark a service function as startup task, annotate it with `@ExecuteOnStartup()` decorator.

You can use startup tasks to initialize an entity database table or migrate entity database table from one version to another.
An example of both of these is available [here](https://github.com/backk-node/backk-example-project/blob/main/src/services/tag/TagServiceImpl.ts)

### <a name="cronjobs"></a> Cron Jobs
In your service, you can specify service functions that are cron jobs. Cron jobs are service functions that
are executed on given schedule, and they cannot be executed by any clients.

To mark a service function as startup task, annotate it with `@CronJob(cronSchedule: CronSchedule, retryIntervalsInSecs: number[] = defaultRetryIntervals)` decorator.

```ts
type CronSchedule = {
  minutes?: number | number[] | Range | 'any';
  minuteInterval?: number;
  
  hours?: number | number[] | Range | 'any';
  hourInterval?: number;
  
  daysOfMonth?: number | number[] | Range | 'any';
  dayInterval?: number;
  
  months?: Month | Month[] | Range | 'any';
  monthInterval?: number;
  
  daysOfWeek?: DayOfWeek | DayOfWeek[] | Range;
  weekDayInterval?: number;
};

type Range = {
  start: number;
  end: number;
};

enum Month {
  Jan,
  Feb,
  Mar,
  Apr,
  May,
  Jun,
  Jul,
  Aug,
  Sep,
  Oct,
  Nov,
  Dec
}

enum DayOfWeek {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

const defaultRetryIntervals = [1, 2, 5, 10, 30, 60, 120, 500];
```

To execute a service function every 5 minutes:
```ts
@CronJob({ minuteInterval: 5 })
```

To execute a service function every night at 02:00
```ts
@CronJob({ minutes: 0, hours: 2 })
```


