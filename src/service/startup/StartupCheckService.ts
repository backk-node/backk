import BaseService from "../BaseService";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";

export default abstract class StartupCheckService extends BaseService {
  static microservice: any | undefined;

  abstract isServiceStarted(): PromiseErrorOr<null>;
}
