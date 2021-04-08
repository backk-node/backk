import { Injectable } from '@nestjs/common';
import AbstractDbManager from '../../dbmanager/AbstractDbManager';
import StartupCheckService from './StartupCheckService';
import createBackkErrorFromErrorMessageAndStatusCode from '../../errors/createBackkErrorFromErrorMessageAndStatusCode';
import initializeDatabase, { isDbInitialized } from '../../dbmanager/sql/operations/ddl/initializeDatabase';
import { HttpStatusCodes } from '../../constants/constants';
import { AllowForClusterInternalUse } from '../../decorators/service/function/AllowForClusterInternalUse';
import scheduleJobsForExecution, { scheduledJobs } from '../../scheduling/scheduleJobsForExecution';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';

@Injectable()
export default class StartupCheckServiceImpl extends StartupCheckService {
  constructor(dbManager: AbstractDbManager) {
    super({}, dbManager);
  }

  // noinspection FunctionWithMoreThanThreeNegationsJS
  @AllowForClusterInternalUse()
  async isServiceStarted(): PromiseErrorOr<null> {
    if (
      !(await isDbInitialized(this.dbManager)) &&
      !(await initializeDatabase(StartupCheckService.controller, this.dbManager))
    ) {
      return [
        null,
        createBackkErrorFromErrorMessageAndStatusCode(
          'Service not initialized (database)',
          HttpStatusCodes.SERVICE_UNAVAILABLE
        )
      ];
    } else if (
      !scheduledJobs &&
      !(await scheduleJobsForExecution(StartupCheckService.controller, this.dbManager))
    ) {
      return [
        null,
        createBackkErrorFromErrorMessageAndStatusCode(
          'Service not initialized (jobs)',
          HttpStatusCodes.SERVICE_UNAVAILABLE
        )
      ];
    }

    return [null, null];
  }
}
