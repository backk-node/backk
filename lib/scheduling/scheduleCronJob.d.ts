import AbstractDbManager from "../dbmanager/AbstractDbManager";
export declare function scheduleCronJob(scheduledExecutionTimestampAsDate: Date, retryIntervalsInSecs: number[], dbManager: AbstractDbManager, jobId: string, controller: any, serviceFunctionName: string, serviceFunctionArgument: any): Promise<void>;
