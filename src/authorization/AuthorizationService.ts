export default abstract class AuthorizationService {
  abstract hasUserRoleIn(roles: string[], authHeader: string): Promise<boolean>;
  abstract areSameIdentities(
    userName: string | undefined,
    authHeader: string
  ): Promise<boolean>;
}
