import AuthorizationService from './AuthorizationService';
export default class DefaultJwtAuthorizationServiceImpl extends AuthorizationService {
    private readonly jwtSigningSecretOrPublicKeyFetchUrl;
    private readonly userNameClaimPath;
    private readonly rolesClaimPath;
    private readonly publicKeyPath?;
    private jwtSigningSecretOrPublicKey;
    constructor(jwtSigningSecretOrPublicKeyFetchUrl: string, userNameClaimPath: string, rolesClaimPath: string, publicKeyPath?: string | undefined);
    areSameIdentities(userName: string | undefined, authHeader: string): Promise<boolean>;
    hasUserRoleIn(roles: string[], authHeader: string): Promise<boolean>;
    private static getJwtFromAuthHeader;
    private isUrl;
    private getJwtSigningSecretOrPublicKey;
}
