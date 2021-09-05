import _Id from "../../types/id/_Id";
import CrudEntityService from "../crudentity/CrudEntityService";
import AllowForServiceInternalUse from "../../decorators/service/function/AllowForServiceInternalUse";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import { One } from "../../datastore/AbstractDataStore";
import Subject from "../../types/useraccount/Subject";

export default class UserAccountBaseService extends CrudEntityService {
  isUsersService(): boolean {
    return true;
  }

  @AllowForServiceInternalUse()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getIdBySubject(subject: Subject): PromiseErrorOr<One<_Id>> {
    throw new Error('Not implemented')
  }
}
