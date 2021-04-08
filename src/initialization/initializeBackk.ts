import AbstractDbManager from "../dbmanager/AbstractDbManager";
import logEnvironment from "../observability/logging/logEnvironment";
import defaultSystemAndNodeJsMetrics from "../observability/metrics/defaultSystemAndNodeJsMetrics";
import initializeDatabase from "../dbmanager/sql/operations/ddl/initializeDatabase";
import reloadLoggingConfigOnChange from "../configuration/reloadLoggingConfigOnChange";
import log, { Severity } from "../observability/logging/log";
import scheduleCronJobsForExecution from "../scheduling/scheduleCronJobsForExecution";
import scheduleJobsForExecution from "../scheduling/scheduleJobsForExecution";
import StartupCheckService from "../service/startup/StartupCheckService";
import initializeCls from "../continuationlocalstorages/initializeCls";

export default async function initializeBackk(controller: any, dbManager: AbstractDbManager) {
  initializeCls();
  StartupCheckService.controller = controller;
  logEnvironment();
  defaultSystemAndNodeJsMetrics.startCollectingMetrics();
  await initializeDatabase(controller, dbManager);
  scheduleCronJobsForExecution(controller, dbManager);
  await scheduleJobsForExecution(controller, dbManager);
  reloadLoggingConfigOnChange();
  log(Severity.INFO, 'Service started', '');
}
