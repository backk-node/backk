import _Id from "../../types/_id/_Id";
import CrudEntityService from "../crudentity/CrudEntityService";
import AllowForMicroserviceInternalUse from "../../decorators/service/function/AllowForMicroserviceInternalUse";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import { One } from "../../datastore/DataStore";
import Subject from "../../types/useraccount/Subject";
import { UserService } from "./UserService";

export default class UserBaseService extends CrudEntityService implements UserService {
  isUserService(): boolean {
    return true;
  }

  @AllowForMicroserviceInternalUse()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getIdBySubject(subject: Subject): PromiseErrorOr<One<_Id>> {
    throw new Error('Not implemented. This method must be implemented in the sub class.')
  }
}
