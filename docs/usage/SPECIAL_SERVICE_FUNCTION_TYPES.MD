## Special Service Function Types

- [Startup Tasks](#startuptasks)
- [Cron Jobs](#cronjobs)

### <a name="startuptasks"></a> Startup Tasks
In your service, you can specify a service function that is a startup task. Startup tasks are service functions
that are executed upon microservice startup, and they cannot be executed by any clients. 

To mark a service function as startup task, annotate it with `@ExecuteOnStartup()` decorator.

You can use startup tasks to initialize an entity table or migrate entity table from one version to another.
Example of both of these is available [here](https://github.com/backk-node/backk-example-project/blob/main/src/services/tag/TagServiceImpl.ts)

### <a name="cronjobs"></a> Cron Jobs
In your service, you can specify a service function that is a cron job. Cron jobs are service functions that
are executed on given schedule, and they cannot be executed by any clients.

To mark a service function as startup task, annotate it with `@CronJob(cronSchedule: CronSchedule, retryIntervalsInSecs: number[] = defaultRetryIntervals)` decorator.

```ts
type CronSchedule = {
  minutes?: number | number[] | Range | 'any';
  minuteInterval?: number;
  
  // 0-23
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

type Range = {
  start: number;
  end: number;
};

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


