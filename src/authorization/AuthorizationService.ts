export default abstract class AuthorizationService {
  abstract hasUserRoleIn(roles: string[], authHeader: string | string[] | undefined): Promise<boolean>;
  abstract getSubjectAndIssuer(
    authHeader: string | string[] | undefined
  ): Promise<[string | undefined, string | undefined]>;
}
