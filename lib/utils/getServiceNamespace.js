"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getServiceName_1 = __importDefault(require("./getServiceName"));
function getNamespacedServiceName() {
    if (!process.env.SERVICE_NAMESPACE) {
        throw new Error('Environment variable SERVICE_NAMESPACE must be defined');
    }
    return getServiceName_1.default() + '.' + process.env.SERVICE_NAMESPACE;
}
exports.default = getNamespacedServiceName;
//# sourceMappingURL=getServiceNamespace.js.map