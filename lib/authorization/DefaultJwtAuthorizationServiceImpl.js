"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_base64_1 = require("js-base64");
const jsonwebtoken_1 = require("jsonwebtoken");
const node_fetch_1 = __importDefault(require("node-fetch"));
const lodash_1 = __importDefault(require("lodash"));
const https_1 = __importDefault(require("https"));
const AuthorizationService_1 = __importDefault(require("./AuthorizationService"));
class DefaultJwtAuthorizationServiceImpl extends AuthorizationService_1.default {
    constructor(jwtSigningSecretOrPublicKeyFetchUrl, userNameClaimPath, rolesClaimPath, publicKeyPath) {
        super();
        this.jwtSigningSecretOrPublicKeyFetchUrl = jwtSigningSecretOrPublicKeyFetchUrl;
        this.userNameClaimPath = userNameClaimPath;
        this.rolesClaimPath = rolesClaimPath;
        this.publicKeyPath = publicKeyPath;
        this.jwtSigningSecretOrPublicKey = '';
    }
    async areSameIdentities(userName, authHeader) {
        if (userName === undefined) {
            return false;
        }
        const jwt = DefaultJwtAuthorizationServiceImpl.getJwtFromAuthHeader(authHeader);
        if (jwt) {
            if (!this.jwtSigningSecretOrPublicKey) {
                this.jwtSigningSecretOrPublicKey = await this.getJwtSigningSecretOrPublicKey();
            }
            const jwtClaims = jsonwebtoken_1.verify(jwt, this.jwtSigningSecretOrPublicKey);
            return lodash_1.default.get(jwtClaims, this.userNameClaimPath) === userName;
        }
        return false;
    }
    async hasUserRoleIn(roles, authHeader) {
        const jwt = DefaultJwtAuthorizationServiceImpl.getJwtFromAuthHeader(authHeader);
        if (jwt) {
            if (!this.jwtSigningSecretOrPublicKey) {
                this.jwtSigningSecretOrPublicKey = await this.getJwtSigningSecretOrPublicKey();
            }
            const jwtClaims = jsonwebtoken_1.verify(jwt, this.jwtSigningSecretOrPublicKey);
            const assignedUserRoles = lodash_1.default.get(jwtClaims, this.rolesClaimPath);
            return roles.some((role) => assignedUserRoles.includes(role));
        }
        return false;
    }
    static getJwtFromAuthHeader(authHeader) {
        const authHeaderParts = authHeader.split('Bearer ');
        if (authHeaderParts[1]) {
            return js_base64_1.Base64.decode(authHeaderParts[1]);
        }
        return '';
    }
    isUrl(value) {
        return value.startsWith('http://') || value.startsWith('https://');
    }
    async getJwtSigningSecretOrPublicKey() {
        if (this.isUrl(this.jwtSigningSecretOrPublicKeyFetchUrl)) {
            if (!this.publicKeyPath) {
                throw new Error('Missing publicKeyPath parameter');
            }
            let agent;
            if (this.jwtSigningSecretOrPublicKeyFetchUrl.startsWith('https://')) {
                agent = new https_1.default.Agent({
                    rejectUnauthorized: false
                });
            }
            const response = await node_fetch_1.default(this.jwtSigningSecretOrPublicKeyFetchUrl, { agent });
            const responseBodyJson = await response.json();
            return lodash_1.default.get(responseBodyJson, this.publicKeyPath);
        }
        else {
            return this.jwtSigningSecretOrPublicKeyFetchUrl;
        }
    }
}
exports.default = DefaultJwtAuthorizationServiceImpl;
//# sourceMappingURL=DefaultJwtAuthorizationServiceImpl.js.map