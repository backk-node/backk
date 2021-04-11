"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pick_1 = __importDefault(require("lodash/pick"));
const omit_1 = __importDefault(require("lodash/omit"));
function transformResponse(responseObjects, args) {
    return responseObjects.map((responseObject) => {
        let newResponseObject = responseObject;
        if (args.includeResponseFields) {
            newResponseObject = pick_1.default(responseObject, args.includeResponseFields);
        }
        if (args.excludeResponseFields) {
            newResponseObject = omit_1.default(newResponseObject, args.excludeResponseFields);
        }
        return newResponseObject;
    });
}
exports.default = transformResponse;
//# sourceMappingURL=transformResponse.js.map