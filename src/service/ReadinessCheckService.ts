import BaseService from "./BaseService";
import { PromiseErrorOr } from "../types/PromiseErrorOr";

export default abstract class ReadinessCheckService extends BaseService {
  abstract isServiceReady(): PromiseErrorOr<null>;
}
