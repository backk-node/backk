import BaseService from "./BaseService";
import { PromiseErrorOr } from "../types/PromiseErrorOr";

export default abstract class ReadinessCheckService extends BaseService {
  getServiceType(): string {
    return 'ReadinessCheckService';
  }

  abstract isMicroserviceReady(): PromiseErrorOr<null>;
}
