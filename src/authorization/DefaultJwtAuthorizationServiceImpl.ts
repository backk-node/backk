import { Base64 } from 'js-base64';
import { verify } from 'jsonwebtoken';
import fetch from 'node-fetch';
import _ from 'lodash';
import https from 'https';
import AuthorizationService from './AuthorizationService';

export default class DefaultJwtAuthorizationServiceImpl extends AuthorizationService {
  private jwtSigningSecretOrPublicKey: string = '';

  constructor(
    private readonly jwtSigningSecretOrPublicKeyFetchUrl: string,
    private readonly userNameClaimPath: string,
    private readonly rolesClaimPath: string,
    private readonly publicKeyPath?: string
  ) {
    super();
  }

  async areSameIdentities(userName: string | undefined, authHeader: string): Promise<boolean> {
    if (userName === undefined) {
      return false;
    }

    const jwt = DefaultJwtAuthorizationServiceImpl.getJwtFromAuthHeader(authHeader);
    if (jwt) {
      if (!this.jwtSigningSecretOrPublicKey) {
        this.jwtSigningSecretOrPublicKey = await this.getJwtSigningSecretOrPublicKey();
      }
      const jwtClaims = verify(jwt, this.jwtSigningSecretOrPublicKey);
      return _.get(jwtClaims, this.userNameClaimPath) === userName;
    }

    return false;
  }

  async hasUserRoleIn(roles: string[], authHeader: string): Promise<boolean> {
    const jwt = DefaultJwtAuthorizationServiceImpl.getJwtFromAuthHeader(authHeader);
    if (jwt) {
      if (!this.jwtSigningSecretOrPublicKey) {
        this.jwtSigningSecretOrPublicKey = await this.getJwtSigningSecretOrPublicKey();
      }
      const jwtClaims = verify(jwt, this.jwtSigningSecretOrPublicKey);
      const assignedUserRoles = _.get(jwtClaims, this.rolesClaimPath);
      return roles.some((role) => assignedUserRoles.includes(role));
    }

    return false;
  }

  private static getJwtFromAuthHeader(authHeader: string): string {
    const authHeaderParts = authHeader.split('Bearer ');
    if (authHeaderParts[1]) {
      return Base64.decode(authHeaderParts[1]);
    }

    return '';
  }

  private isUrl(value: string): boolean {
    return value.startsWith('http://') || value.startsWith('https://');
  }

  private async getJwtSigningSecretOrPublicKey() {
    if (this.isUrl(this.jwtSigningSecretOrPublicKeyFetchUrl)) {
      if (!this.publicKeyPath) {
        throw new Error('Missing publicKeyPath parameter');
      }

      let agent;
      if (this.jwtSigningSecretOrPublicKeyFetchUrl.startsWith('https://')) {
        agent = new https.Agent({
          rejectUnauthorized: false
        });
      }
      const response = await fetch(this.jwtSigningSecretOrPublicKeyFetchUrl, { agent });
      const responseBodyJson = await response.json();
      return _.get(responseBodyJson, this.publicKeyPath);
    } else {
      return this.jwtSigningSecretOrPublicKeyFetchUrl;
    }
  }
}
