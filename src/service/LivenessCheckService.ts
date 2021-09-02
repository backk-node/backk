import BaseService from "./BaseService";
import { PromiseErrorOr } from "../types/PromiseErrorOr";

export default abstract class LivenessCheckService extends BaseService {
  abstract isMicroserviceAlive(): PromiseErrorOr<null>;
}
