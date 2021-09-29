import BaseService from "../BaseService";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";

export default abstract class StartupCheckService extends BaseService {
  getServiceType(): string {
    return 'StartupCheckService'
  }

  static microservice: any | undefined;

  abstract isMicroserviceStarted(): PromiseErrorOr<null>;
}
