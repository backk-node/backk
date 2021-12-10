import { DataStore } from "../../datastore/DataStore";
import StartupCheckService from "./StartupCheckService";
import createBackkErrorFromErrorMessageAndStatusCode
  from "../../errors/createBackkErrorFromErrorMessageAndStatusCode";
import initializeDatabase, { isDbInitialized } from "../../datastore/sql/operations/ddl/initializeDatabase";
import { HttpStatusCodes } from "../../constants/constants";
import scheduleJobsForExecution, { scheduledJobs } from "../../scheduling/scheduleJobsForExecution";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import AllowForEveryUser from "../../decorators/service/function/AllowForEveryUser";

export default class DefaultStartupCheckServiceImpl extends StartupCheckService {
  constructor(dataStore: DataStore) {
    super({}, dataStore);
  }

  // noinspection FunctionWithMoreThanThreeNegationsJS
  @AllowForEveryUser()
  async isMicroserviceStarted(): PromiseErrorOr<null> {
    if (
      !(await isDbInitialized(this.dataStore)) &&
      !(await initializeDatabase(StartupCheckService.microservice, this.dataStore))
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
      !(await scheduleJobsForExecution(StartupCheckService.microservice, this.dataStore))
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
