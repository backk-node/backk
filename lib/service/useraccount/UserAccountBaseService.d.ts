import _Id from "../../types/id/_Id";
import CrudEntityService from "../crudentity/CrudEntityService";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import UserName from "../../types/useraccount/UserName";
export default class UserAccountBaseService extends CrudEntityService {
    isUsersService(): boolean;
    getUserNameById(id: _Id): PromiseErrorOr<UserName>;
}
