import BaseService from "./BaseService";
import { PromiseErrorOr } from "../types/PromiseErrorOr";

export default abstract class LivenessCheckService extends BaseService {
  getServiceType(): string {
    return "LivenessCheckService";
  }

  abstract isMicroserviceAlive(): PromiseErrorOr<null>;
}
