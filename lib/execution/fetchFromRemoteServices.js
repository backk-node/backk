"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("../metadata/getClassPropertyNameToPropertyTypeNameMap"));
const forEachAsyncParallel_1 = __importDefault(require("../utils/forEachAsyncParallel"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../decorators/typeproperty/typePropertyAnnotationContainer"));
const callRemoteService_1 = __importDefault(require("../remote/http/callRemoteService"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
async function fetchFromRemoteServices(Type, serviceFunctionArgument, response, types, responsePath = '') {
    const typePropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap_1.default(Type);
    try {
        await forEachAsyncParallel_1.default(Object.entries(typePropertyNameToPropertyTypeNameMap), async ([propertyName, propertyTypeName]) => {
            const remoteServiceFetchSpec = typePropertyAnnotationContainer_1.default.getTypePropertyRemoteServiceFetchSpec(Type, propertyName);
            if (remoteServiceFetchSpec) {
                const remoteServiceFunctionArgument = remoteServiceFetchSpec.buildRemoteServiceFunctionArgument(serviceFunctionArgument, response);
                const [remoteResponse, error] = await callRemoteService_1.default(remoteServiceFetchSpec.remoteServiceFunctionUrl, remoteServiceFunctionArgument, remoteServiceFetchSpec.options);
                if (error) {
                    error.message = `${remoteServiceFetchSpec.remoteServiceFunctionUrl} failed: ${error.message}`;
                    throw error;
                }
                lodash_1.default.set(response, responsePath + propertyName, remoteResponse);
            }
            const { baseTypeName } = getTypeInfoForTypeName_1.default(propertyTypeName);
            if (types[baseTypeName]) {
                await fetchFromRemoteServices(types[baseTypeName], serviceFunctionArgument, response, types, (responsePath ? responsePath + '.' : '') + propertyName);
            }
        });
    }
    catch (error) {
        if (responsePath !== '') {
            throw error;
        }
        return error;
    }
    return null;
}
exports.default = fetchFromRemoteServices;
//# sourceMappingURL=fetchFromRemoteServices.js.map