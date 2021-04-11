import BaseService from '../service/BaseService';
import UserAccountBaseService from '../service/useraccount/UserAccountBaseService';
export default function tryAuthorize(service: BaseService, functionName: string, serviceFunctionArgument: any, authHeader: string | undefined, authorizationService: any, usersService: UserAccountBaseService | undefined): Promise<void | string>;
