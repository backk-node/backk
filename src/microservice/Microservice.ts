import { DataStore } from '../datastore/DataStore';
import log, { Severity } from '../observability/logging/log';
import initializeMicroservice from './initializeMicroservice';
import changePackageJsonNameProperty from '../utils/changePackageJsonNameProperty';
import initializeCls from '../continuationlocalstorage/initializeCls';
import StartupCheckService from '../services/startup/StartupCheckService';
import logEnvironment from '../observability/logging/logEnvironment';
import defaultSystemAndNodeJsMetrics from '../observability/metrics/defaultSystemAndNodeJsMetrics';
import initializeDatabase from '../datastore/sql/operations/ddl/initializeDatabase';
import scheduleCronJobsForExecution from '../scheduling/scheduleCronJobsForExecution';
import scheduleJobsForExecution from '../scheduling/scheduleJobsForExecution';
import reloadLoggingConfigOnChange from '../configuration/reloadLoggingConfigOnChange';
import { RequestProcessor } from '../requestprocessor/RequestProcessor';
import areTypeDefinitionsUsedInTypeFilesChanged
  from "../typescript/utils/areTypeDefinitionsUsedInTypeFilesChanged";

export type HttpVersion = 1 | 2;

type NonEmptyArray<T> = [T, ...T[]];

export default class Microservice {
  constructor(public readonly dataStore: DataStore) {}

  async initialize(
    commandLineArgs: string[],
    requestProcessors: NonEmptyArray<RequestProcessor>,
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

    if (
      commandLineArgs?.[2] &&
      commandLineArgs?.[2] !== '--generateApiSpecsOnly' &&
      commandLineArgs?.[2] !== '--generateClientsOnly' &&
      commandLineArgs?.[2] !== '--generateClientsOnlyIfNeeded'
    ) {
      console.error(
        'Invalid command line parameter: ' +
          commandLineArgs?.[2] +
          '\nSupported command line parameters are:\n--generateApiSpecsOnly\n--generateClientsOnly\n--generateClientsOnlyIfNeeded'
      );
      process.exit(1);
    }

    await initializeMicroservice(
      this,
      this.dataStore,
      shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv,
      commandLineArgs?.[2] ?? '',
      requestProcessors
    );

    if (
      commandLineArgs?.[2] === '--generateApiSpecsOnly' ||
      commandLineArgs?.[2] === '--generateClientsOnly' ||
      commandLineArgs?.[2] === '--generateClientsOnlyIfNeeded'
    ) {
      process.exit(0);
    }

    if (process.env.NODE_ENV === 'development' && areTypeDefinitionsUsedInTypeFilesChanged()) {
      console.log("Type definitions have changed.\nRun 'npm run generateTypes'");
      process.exit(0);
    }

    process.on('exit', (code) => {
      log(Severity.INFO, `Microservice terminated with exit code: ${code}`, '');
    });

    changePackageJsonNameProperty();
    initializeCls();
    StartupCheckService.microservice = this;
    logEnvironment();
    defaultSystemAndNodeJsMetrics.startCollectingMetrics();
    await initializeDatabase(this, this.dataStore);
    scheduleCronJobsForExecution(this, this.dataStore);
    await scheduleJobsForExecution(this, this.dataStore);
    reloadLoggingConfigOnChange();
    log(Severity.INFO, 'Microservice initialized', '');

    requestProcessors.forEach(requestProcessor => requestProcessor.startProcessingRequests(this));
  }
}
