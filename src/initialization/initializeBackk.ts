import AbstractDataStore from "../datastore/AbstractDataStore";
import logEnvironment from "../observability/logging/logEnvironment";
import defaultSystemAndNodeJsMetrics from "../observability/metrics/defaultSystemAndNodeJsMetrics";
import initializeDatabase from "../datastore/sql/operations/ddl/initializeDatabase";
import reloadLoggingConfigOnChange from "../configuration/reloadLoggingConfigOnChange";
import log, { Severity } from "../observability/logging/log";
import scheduleCronJobsForExecution from "../scheduling/scheduleCronJobsForExecution";
import scheduleJobsForExecution from "../scheduling/scheduleJobsForExecution";
import StartupCheckService from "../service/startup/StartupCheckService";
import initializeCls from "../continuationlocalstorage/initializeCls";
import Microservice from "../microservice/Microservice";

export default async function initializeBackk(microservice: Microservice) {
  initializeCls();
  StartupCheckService.microservice = microservice;
  logEnvironment();
  defaultSystemAndNodeJsMetrics.startCollectingMetrics();
  await initializeDatabase(microservice, microservice.dataStore);
  scheduleCronJobsForExecution(microservice, microservice.dataStore);
  await scheduleJobsForExecution(microservice, microservice.dataStore);
  reloadLoggingConfigOnChange();
  log(Severity.INFO, 'Service started', '');
}
