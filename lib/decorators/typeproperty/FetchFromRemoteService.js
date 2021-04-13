"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function FetchFromRemoteService(remoteServiceFunctionUrl, buildRemoteServiceFunctionArgument, options) {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsFetchedFromRemoteService(object.constructor, propertyName, remoteServiceFunctionUrl, buildRemoteServiceFunctionArgument, options);
    };
}
exports.default = FetchFromRemoteService;
//# sourceMappingURL=FetchFromRemoteService.js.map