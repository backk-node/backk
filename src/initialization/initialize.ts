import logEnvironment from '../observability/logging/logEnvironment';
import defaultSystemAndNodeJsMetrics from '../observability/metrics/defaultSystemAndNodeJsMetrics';
import initializeDatabase from '../datastore/sql/operations/ddl/initializeDatabase';
import reloadLoggingConfigOnChange from '../configuration/reloadLoggingConfigOnChange';
import log, { Severity } from '../observability/logging/log';
import scheduleCronJobsForExecution from '../scheduling/scheduleCronJobsForExecution';
import scheduleJobsForExecution from '../scheduling/scheduleJobsForExecution';
import StartupCheckService from '../service/startup/StartupCheckService';
import initializeCls from '../continuationlocalstorage/initializeCls';
import Microservice from '../microservice/Microservice';
import initializeMicroservice from '../microservice/initializeMicroservice';
import changePackageJsonNameProperty from '../utils/changePackageJsonNameProperty';

export default async function initialize(
  microservice: Microservice,
  commandLineArgs?: string[],
  shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv = true
) {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.NODE_ENV !== 'integration' &&
    process.env.NODE_ENV !== 'production'
  ) {
    throw new Error(
      'NODE_ENV environment variable must be defined and have one of following values: development, integration or production'
    );
  }

  process.on('uncaughtExceptionMonitor', (error: Error) => {
    log(Severity.ERROR, `Microservice crashed with exception: ${error.message}`, error.stack ?? '');
  });

  if (commandLineArgs?.[2] && commandLineArgs?.[2] !== '--generateApiSpecsOnly' && commandLineArgs?.[2] !== '--enableProcessKillService') {
    console.error(
      'Invalid command line parameter: ' +
        commandLineArgs?.[2] +
        '\nSupported command line parameters are:\n--generateApiSpecsOnly\n--enableProcessKillService'
    );
    process.exit(1);
  }

  if (commandLineArgs?.[2] === '--enableProcessKillService') {
    microservice.isProcessKillServiceEnabled = true;
  }

  initializeMicroservice(
    microservice,
    microservice.dataStore,
    shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv,
    commandLineArgs?.[2] ?? ''
  );

  if (commandLineArgs?.[2] === '--generateApiSpecsOnly') {
    process.exit(0);
  }

  process.on('exit', (code) => {
    log(Severity.INFO, `Microservice terminated with exit code: ${code}`, '');
  });

  changePackageJsonNameProperty();
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
