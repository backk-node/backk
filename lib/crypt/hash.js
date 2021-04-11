"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const argon2 = __importStar(require("argon2"));
async function hash(value) {
    if (value.startsWith('$argon2id$v=19$m=4096,t=5,p=1')) {
        const [, saltAndHashValue] = value.split('$argon2id$v=19$m=4096,t=5,p=1');
        if (saltAndHashValue.length === 67) {
            return Promise.resolve(value);
        }
    }
    return await argon2.hash(value, {
        type: argon2.argon2id,
        timeCost: 5
    });
}
exports.default = hash;
//# sourceMappingURL=hash.js.map