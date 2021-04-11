"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const callRemoteService_1 = __importDefault(require("./callRemoteService"));
async function makeHttpRequest(requestUrl, requestBodyObject, options) {
    return await callRemoteService_1.default(requestUrl, requestBodyObject, options);
}
exports.default = makeHttpRequest;
//# sourceMappingURL=makeHttpRequest.js.map