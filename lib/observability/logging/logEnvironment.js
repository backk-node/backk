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
const log_1 = __importStar(require("./log"));
function logEnvironment() {
    const filteredEnvironment = Object.entries(process.env).reduce((accumulatedEnvironment, [envVariableName, envVariableValue]) => {
        const upperCaseEnvVariableName = envVariableName.toUpperCase();
        if (!upperCaseEnvVariableName.includes('SECRET') &&
            !upperCaseEnvVariableName.includes('KEY') &&
            !upperCaseEnvVariableName.includes('CRYPT') &&
            !upperCaseEnvVariableName.includes('CIPHER') &&
            !upperCaseEnvVariableName.includes('CODE') &&
            !upperCaseEnvVariableName.includes('PASSWORD') &&
            !upperCaseEnvVariableName.includes('PASSWD') &&
            !upperCaseEnvVariableName.includes('PWD') &&
            !upperCaseEnvVariableName.includes('PASSPHRASE')) {
            return { ...accumulatedEnvironment, [envVariableName]: envVariableValue };
        }
        return accumulatedEnvironment;
    }, {});
    log_1.default(log_1.Severity.DEBUG, 'Environment', '', filteredEnvironment);
}
exports.default = logEnvironment;
//# sourceMappingURL=logEnvironment.js.map