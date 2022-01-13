import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import ReadinessCheckService from "./ReadinessCheckService";
import Microservice from "../../microservice/Microservice";
import NullDataStore from "../../datastore/NullDataStore";
import createBackkErrorFromErrorMessageAndStatusCode
  from "../../errors/createBackkErrorFromErrorMessageAndStatusCode";
import { HttpStatusCodes } from "../../constants/constants";

export default class DefaultReadinessCheckServiceImpl extends ReadinessCheckService {
  constructor(private readonly microservice: Microservice) {
    super({}, new NullDataStore());
  }

  isMicroserviceReady(): PromiseErrorOr<null> {
    if (this.microservice.getIsTerminationRequested()) {
      return Promise.resolve([
        null,
        createBackkErrorFromErrorMessageAndStatusCode(
          'Service is terminating',
          HttpStatusCodes.SERVICE_UNAVAILABLE
        )
      ]);
    }

    return Promise.resolve([null, null]);
  }
}
