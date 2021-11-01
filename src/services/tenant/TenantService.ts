import { One } from "../../datastore/DataStore";
import { PromiseErrorOr } from "../../types/PromiseErrorOr";
import _Id from "../../types/_id/_Id";
import { Service } from "../Service";
import Issuer from "../../types/useraccount/Issuer";

export interface TenantService extends Service {
  isUserService(): boolean;
  getIdByIssuer(issuer: Issuer): PromiseErrorOr<One<_Id>>;
}
