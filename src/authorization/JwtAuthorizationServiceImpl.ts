import { Base64 } from 'js-base64';
import { verify } from 'jsonwebtoken';
import fetch from 'node-fetch';
import _ from 'lodash';
import https from 'https';
import AuthorizationService from './AuthorizationService';
import throwException from '../utils/exception/throwException';
import log, { Severity } from '../observability/logging/log';

export default class JwtAuthorizationServiceImpl extends AuthorizationService {
  private signSecretOrPublicKey: string | undefined;
  private readonly authServerPublicKeyUrl: string;
  private readonly rolesClaimPath: string;
  private readonly publicKeyPath: string;

  constructor() {
    super();

    this.rolesClaimPath =
      process.env.JWT_ROLES_CLAIM_PATH ??
      throwException('`JWT_ROLES_CLAIM_PATH` environment variable must be defined');

    this.publicKeyPath =
      process.env.PUBLIC_KEY_PATH ??
      throwException('PUBLIC_KEY_PATH environment variable must be defined');

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'integration') {
      this.signSecretOrPublicKey = process.env.JWT_SIGN_SECRET ?? 'abcdef';
      this.authServerPublicKeyUrl = '';
    } else {
      this.authServerPublicKeyUrl = process.env.AUTH_SERVER_PUBLIC_KEY_URL ?? throwException('AUTH_SERVER_PUBLIC_KEY_URL environment variable must be defined');
    }
  }

  async getSubject(authHeader: string): Promise<string | undefined> {
    const jwt = JwtAuthorizationServiceImpl.getJwtFrom(authHeader);

    if (jwt) {
      if (!this.signSecretOrPublicKey) {
        try {
          this.signSecretOrPublicKey = await this.tryGetPublicKey();
        } catch (error) {
          log(
            Severity.ERROR,
            `Failed to fetch public key from Authorization Server: ${this.authServerPublicKeyUrl} with error: ` +
              error.message,
            error.stack
          );
          return undefined
        }
      }

      try {
        const jwtClaims = verify(jwt, this.signSecretOrPublicKey);
        return _.get(jwtClaims, 'sub');
      } catch {
        return Promise.resolve(undefined);
      }
    }

    return undefined;
  }

  async hasUserRoleIn(roles: string[], authHeader: string): Promise<boolean> {
    const jwt = JwtAuthorizationServiceImpl.getJwtFrom(authHeader);

    if (jwt) {
      if (!this.signSecretOrPublicKey) {
        try {
          this.signSecretOrPublicKey = await this.tryGetPublicKey();
        } catch (error) {
          log(
            Severity.ERROR,
            `Failed to fetch public key from Authorization Server: ${this.authServerPublicKeyUrl} with error: ` +
            error.message,
            error.stack
          );
          return false;
        }
      }

      try {
        const jwtClaims = verify(jwt, this.signSecretOrPublicKey);
        const assignedUserRoles = _.get(jwtClaims, this.rolesClaimPath);
        return roles.some((role) => assignedUserRoles.includes(role));
      } catch {
        return false;
      }
    }

    return false;
  }

  private static getJwtFrom(authHeader: string): string {
    const base64EncodedJwt = authHeader.split('Bearer ').pop();
    return base64EncodedJwt ? Base64.decode(base64EncodedJwt) : '';
  }

  private async tryGetPublicKey(): Promise<string> {
    let agent;

    if (this.authServerPublicKeyUrl.startsWith('https://')) {
      agent = new https.Agent({
        rejectUnauthorized: false
      });
    }

    const response = await fetch(this.authServerPublicKeyUrl, { agent });
    const responseBodyObject = await response.json();
    return _.get(responseBodyObject, this.publicKeyPath);
  }
}
