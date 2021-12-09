export interface AuthorizationService {
  hasUserRoleIn(roles: string[], authHeader: string | string[] | undefined): Promise<boolean>;
  getSubjectAndIssuer(
    authHeader: string | string[] | undefined
  ): Promise<[string | undefined, string | undefined]>;
}
