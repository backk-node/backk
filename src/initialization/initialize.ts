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
import initializeMicroservice from "../microservice/initializeMicroservice";

export default async function initialize(microservice: Microservice) {
  initializeMicroservice(microservice, microservice.dataStore);
  initializeCls();
  StartupCheckService.microservice = microservice;
  logEnvironment();
  defaultSystemAndNodeJsMetrics.startCollectingMetrics();
  await initializeDatabase(microservice, microservice.dataStore);
  scheduleCronJobsForExecution(microservice, microservice.dataStore);
  await scheduleJobsForExecution(microservice, microservice.dataStore);
  reloadLoggingConfigOnChange();
  log(Severity.INFO, 'Microservice initialized', '');
}
