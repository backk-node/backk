import { Resource } from '../LogEntry';

export type UserOperation =
  | 'loginUser'
  | 'verifyUserLogin'
  | 'lockUserTemporarily'
  | 'lockUserPermanently'
  | 'forgotPassword'
  | 'logoutUser'
  | 'changeUserPassword'
  | 'updateUser'
  | 'createUser'
  | 'verifyUser'
  | 'deleteUser'
  | 'createUserGroup'
  | 'deleteUserGroup'
  | 'associateUserWithRole'
  | 'disassociateUserWithRole'
  | 'associateUserGroupWithRole'
  | 'disassociateUserGroupWithRole'
  | 'addUserToGroup'
  | 'removeUserFromGroup'

export type UserOperationResult = 'success' | 'failure'

export interface AuditLogEntry {
  Timestamp: string;
  TraceId?: string;
  SpanId?: string;
  TraceFlags?: number;
  userName: string;
  clientIp: string;
  authorizationHeader: string;
  userOperation: UserOperation | string;
  userOperationResult: UserOperationResult;
  userOperationHttpStatusCode: number;
  userOperationErrorMessage: string;
  Resource: Resource;
  Attributes?: { [key: string]: string | number | boolean | undefined };
}
