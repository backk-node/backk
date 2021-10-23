// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import bfj from 'bfj';
import AbstractDataStore from '../datastore/AbstractDataStore';
import log, { Severity } from '../observability/logging/log';
import initializeMicroservice from './initializeMicroservice';
import changePackageJsonNameProperty from '../utils/changePackageJsonNameProperty';
import initializeCls from '../continuationlocalstorage/initializeCls';
import StartupCheckService from '../service/startup/StartupCheckService';
import logEnvironment from '../observability/logging/logEnvironment';
import defaultSystemAndNodeJsMetrics from '../observability/metrics/defaultSystemAndNodeJsMetrics';
import initializeDatabase from '../datastore/sql/operations/ddl/initializeDatabase';
import scheduleCronJobsForExecution from '../scheduling/scheduleCronJobsForExecution';
import scheduleJobsForExecution from '../scheduling/scheduleJobsForExecution';
import reloadLoggingConfigOnChange from '../configuration/reloadLoggingConfigOnChange';
import tryExecuteServiceMethod, {
  ServiceFunctionExecutionOptions
} from '../execution/tryExecuteServiceMethod';
import { createServer } from 'http';
import throwException from '../utils/exception/throwException';
import createBackkErrorFromErrorCodeMessageAndStatus from '../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../errors/backkErrors';
import { ITopicConfig } from 'kafkajs';
import consumeFromKafka from '../remote/messagequeue/kafka/consumeFromKafka';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import consumeFromRedis from '../remote/messagequeue/redis/consumeFromRedis';

export type HttpVersion = 1;

export default class Microservice {
  private isInitialized = false;
  constructor(public readonly dataStore: AbstractDataStore) {}

  async initialize(commandLineArgs: string[], shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv = true) {
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

    if (commandLineArgs?.[2] && commandLineArgs?.[2] !== '--generateApiSpecsOnly') {
      console.error(
        'Invalid command line parameter: ' +
          commandLineArgs?.[2] +
          '\nSupported command line parameters are:\n--generateApiSpecsOnly'
      );
      process.exit(1);
    }

    initializeMicroservice(
      this,
      this.dataStore,
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
    StartupCheckService.microservice = this;
    logEnvironment();
    defaultSystemAndNodeJsMetrics.startCollectingMetrics();
    await initializeDatabase(this, this.dataStore);
    scheduleCronJobsForExecution(this, this.dataStore);
    await scheduleJobsForExecution(this, this.dataStore);
    reloadLoggingConfigOnChange();
    log(Severity.INFO, 'Microservice initialized', '');
    this.setIsInitialized(true);
  }

  async startHttpServer(options?: ServiceFunctionExecutionOptions, httpVersion: HttpVersion = 1) {
    if (!this.getIsInitialized()) {
      throw new Error(
        'Microservice must be initialized with a call to initialize function before calling startHttpServer'
      );
    }

    const server = createServer((request, response) => {
      request.setEncoding('utf8');

      const contentLength = request.headers['content-length']
        ? parseInt(request.headers['content-length'], 10)
        : Number.MAX_SAFE_INTEGER;

      const MAX_REQUEST_CONTENT_LENGTH_IN_BYTES = parseInt(
        process.env.MAX_REQUEST_CONTENT_LENGTH_IN_BYTES ??
          throwException('MAX_REQUEST_CONTENT_LENGTH_IN_BYTES environment variable must be defined'),
        10
      );

      if (contentLength === undefined || contentLength > MAX_REQUEST_CONTENT_LENGTH_IN_BYTES) {
        const backkError = createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.REQUEST_IS_TOO_LONG);
        response.writeHead(backkError.statusCode, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(backkError));
        return;
      }

      let serviceFunctionArgument;

      try {
        if (request.method === 'GET') {
          const argumentInJsonQueryParameter = request.url?.split('?arg=').pop();
          serviceFunctionArgument = JSON.parse(argumentInJsonQueryParameter ?? '');
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          serviceFunctionArgument = await bfj.parse(request);
        }
      } catch (error) {
        const backkError = createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.INVALID_ARGUMENT,
          message: BACKK_ERRORS.INVALID_ARGUMENT.message + error.message
        });
        response.writeHead(backkError.statusCode, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(backkError));
        return;
      }

      const isClusterInternalCall = !request.url?.includes(
        process.env.API_GATEWAY_PATH ?? throwException('API_GATEWAY_PATH environment variable is not defined')
      );

      tryExecuteServiceMethod(
        this,
        request.url?.split('/').pop() ?? '',
        serviceFunctionArgument,
        request.headers,
        request.method ?? '',
        response,
        isClusterInternalCall,
        options
      );
    });

    function exit(signal: string) {
      server.close(() => {
        log(Severity.INFO, `HTTP server terminated due to signal: ${signal}`, '');
        process.exitCode = 0;
      });
    }

    process.once('SIGINT', exit);
    process.once('SIGQUIT', exit);
    process.once('SIGTERM', exit);

    process.on('uncaughtExceptionMonitor', () => {
      server.close();
    });

    const port = process.env.HTTP_SERVER_PORT ?? 3000;

    log(Severity.INFO, `HTTP server started, listening to port ${port}`, '');
    return server.listen(port);
  }

  async startKafkaConsumer(defaultTopicConfig?: Omit<ITopicConfig, 'topic'>, additionalTopics?: string[]) {
    if (!this.getIsInitialized()) {
      throw new Error(
        'Microservice must be initialized with a call to initialize function before calling startKafkaConsumer'
      );
    }

    await consumeFromKafka(
      this,
      process.env.KAFKA_HOST,
      process.env.KAFKA_PORT,
      getNamespacedMicroserviceName(),
      defaultTopicConfig,
      additionalTopics
    );
  }

  async startRedisConsumer() {
    if (!this.getIsInitialized()) {
      throw new Error(
        'Microservice must be initialized with a call to initialize function before calling startRedisConsumer'
      );
    }

    await consumeFromRedis(this, process.env.REDIS_HOST, process.env.REDIS_PORT);
  }

  setIsInitialized(isInitialized: boolean) {
    this.isInitialized = isInitialized;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}
