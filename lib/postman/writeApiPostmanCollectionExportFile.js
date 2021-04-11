"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const jsonwebtoken_1 = require("jsonwebtoken");
const js_base64_1 = require("js-base64");
const getServiceFunctionTestArgument_1 = __importDefault(require("./getServiceFunctionTestArgument"));
const createPostmanCollectionItem_1 = __importDefault(require("./createPostmanCollectionItem"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../decorators/service/function/serviceFunctionAnnotationContainer"));
const getServiceFunctionExampleReturnValue_1 = __importDefault(require("./getServiceFunctionExampleReturnValue"));
function writeApiPostmanCollectionExportFile(controller, servicesMetadata) {
    const serviceItemGroups = [];
    servicesMetadata.forEach((serviceMetadata) => {
        const functionItemGroups = [];
        serviceMetadata.functions.forEach((functionMetadata) => {
            let items = [];
            if (serviceFunctionAnnotationContainer_1.default.hasOnStartUp(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName)) {
                return;
            }
            const sampleArg = getServiceFunctionTestArgument_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, functionMetadata.functionName, functionMetadata.argType, serviceMetadata, false);
            const { baseTypeName, isArrayType } = getTypeInfoForTypeName_1.default(functionMetadata.returnValueType);
            const exampleReturnValue = getServiceFunctionExampleReturnValue_1.default(controller[serviceMetadata.serviceName].Types, functionMetadata.functionName, baseTypeName, serviceMetadata, false);
            items.push(createPostmanCollectionItem_1.default(controller[serviceMetadata.serviceName].constructor, serviceMetadata, functionMetadata, sampleArg, undefined, undefined, exampleReturnValue, isArrayType));
            functionItemGroups.push({
                name: functionMetadata.functionName,
                item: items
            });
        });
        serviceItemGroups.push({
            name: serviceMetadata.serviceName,
            item: functionItemGroups
        });
    });
    const cwd = process.cwd();
    const appName = cwd.split('/').reverse()[0];
    const jwt = jsonwebtoken_1.sign({ userName: 'abc', roles: [process.env.TEST_USER_ROLE] }, process.env.JWT_SIGN_SECRET || 'abcdef');
    const postmanMetadata = {
        info: {
            name: appName + ' API',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        auth: {
            type: 'bearer',
            bearer: [
                {
                    key: 'token',
                    value: js_base64_1.Base64.encode(jwt),
                    type: 'string'
                }
            ]
        },
        item: [
            {
                name: 'metadataService.getServicesMetadata',
                request: {
                    method: 'POST',
                    url: {
                        raw: 'http://localhost:3000/metadataService.getServicesMetadata',
                        protocol: 'http',
                        host: ['localhost'],
                        port: '3000',
                        path: ['metadataService.getServicesMetadata']
                    }
                }
            },
            ...serviceItemGroups
        ]
    };
    if (!fs_1.existsSync(cwd + '/postman')) {
        fs_1.mkdirSync(cwd + '/postman');
    }
    fs_1.writeFileSync(process.cwd() + '/postman/' + appName.replace(/-/g, '_') + '_api_postman_collection.json', JSON.stringify(postmanMetadata, null, 4));
}
exports.default = writeApiPostmanCollectionExportFile;
//# sourceMappingURL=writeApiPostmanCollectionExportFile.js.map