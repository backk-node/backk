import _Id from "../../types/id/_Id";
import CrudEntityService from "../crudentity/CrudEntityService";
import AllowForServiceInternalUse from "../../decorators/service/function/AllowForServiceInternalUse";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import UserName from "../../types/useraccount/UserName";
import { One } from "../../dbmanager/AbstractDbManager";

export default class UserAccountBaseService extends CrudEntityService {
  isUsersService(): boolean {
    return true;
  }

  @AllowForServiceInternalUse()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getUserNameById(id: _Id): PromiseErrorOr<One<UserName>> {
    throw new Error('Not implemented')
  }
}
