import _Id from "../../types/id/_Id";
import CrudEntityService from "../crudentity/CrudEntityService";
import AllowForServiceInternalUse from "../../decorators/service/function/AllowForServiceInternalUse";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import Subject from "../../types/useraccount/Subject";
import { One } from "../../datastore/AbstractDataStore";

export default class UserAccountBaseService extends CrudEntityService {
  isUsersService(): boolean {
    return true;
  }

  @AllowForServiceInternalUse()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSubjectById(id: _Id): PromiseErrorOr<One<Subject>> {
    throw new Error('Not implemented')
  }
}
