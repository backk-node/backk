export default abstract class AuthorizationService {
  abstract hasUserRoleIn(roles: string[], authHeader: string | string[] | undefined): Promise<boolean>;
  abstract areSameIdentities(
    subject: string | undefined,
    authHeader: string | string[] | undefined
  ): Promise<boolean>;
}
