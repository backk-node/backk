import AbstractDbManager from "../dbmanager/AbstractDbManager";
import __Backk__JobScheduling from "./entities/__Backk__JobScheduling";
export declare let scheduledJobs: __Backk__JobScheduling[] | null | undefined;
export default function scheduleJobsForExecution(controller: any | undefined, dbManager: AbstractDbManager): Promise<boolean>;
