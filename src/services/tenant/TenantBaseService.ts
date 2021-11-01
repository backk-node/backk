import _Id from "../../types/_id/_Id";
import CrudEntityService from "../crudentity/CrudEntityService";
import AllowForMicroserviceInternalUse
  from "../../decorators/service/function/AllowForMicroserviceInternalUse";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import { One } from "../../datastore/DataStore";
import { TenantService } from "./TenantService";
import Issuer from "../../types/useraccount/Issuer";

export default class TenantBaseService extends CrudEntityService implements TenantService {
  isTenantService(): boolean {
    return true;
  }

  @AllowForMicroserviceInternalUse()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getIdByIssuer(issuer: Issuer): PromiseErrorOr<One<_Id>> {
    throw new Error('Not implemented. This method must be implemented in the sub class.')
  }
}
