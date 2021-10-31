import { One } from '../../datastore/DataStore';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
import Subject from '../../types/useraccount/Subject';
import _Id from '../../types/_id/_Id';
import { Service } from '../Service';

export interface UserService extends Service {
  isUserService(): boolean;
  getIdBySubject(subject: Subject): PromiseErrorOr<One<_Id>>;
}
