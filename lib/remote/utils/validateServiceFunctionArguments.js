"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateServiceFunctionArguments = exports.remoteServiceNameToControllerMap = void 0;
const forEachAsyncSequential_1 = __importDefault(require("../../utils/forEachAsyncSequential"));
const parseRemoteServiceFunctionCallUrlParts_1 = __importDefault(require("./parseRemoteServiceFunctionCallUrlParts"));
const fs_1 = __importDefault(require("fs"));
const generateClassFromSrcFile_1 = __importDefault(require("../../typescript/generator/generateClassFromSrcFile"));
const initializeController_1 = __importDefault(require("../../controller/initializeController"));
const class_transformer_1 = require("class-transformer");
const tryValidateServiceFunctionArgument_1 = __importDefault(require("../../validation/tryValidateServiceFunctionArgument"));
const NoOpDbManager_1 = __importDefault(require("../../dbmanager/NoOpDbManager"));
exports.remoteServiceNameToControllerMap = {};
const noOpDbManager = new NoOpDbManager_1.default('');
async function validateServiceFunctionArguments(sends) {
    await forEachAsyncSequential_1.default(sends, async ({ remoteServiceFunctionUrl, serviceFunctionArgument }) => {
        const { topic, serviceFunctionName } = parseRemoteServiceFunctionCallUrlParts_1.default(remoteServiceFunctionUrl);
        const [serviceName, functionName] = serviceFunctionName.split('.');
        let controller;
        let ServiceClass;
        if (exports.remoteServiceNameToControllerMap[`${topic}$/${serviceName}`]) {
            controller = exports.remoteServiceNameToControllerMap[`${topic}$/${serviceName}`];
            ServiceClass = controller[serviceName].constructor;
        }
        else {
            let remoteServiceRootDir;
            if (fs_1.default.existsSync('../' + topic + '/src')) {
                remoteServiceRootDir = '../' + topic;
            }
            else if (fs_1.default.existsSync('./' + topic + '/src')) {
                remoteServiceRootDir = './' + topic;
            }
            else {
                return;
            }
            ServiceClass = generateClassFromSrcFile_1.default(serviceName.charAt(0).toUpperCase() + serviceName.slice(1) + 'Impl', remoteServiceRootDir);
            const serviceInstance = new ServiceClass(noOpDbManager);
            controller = {
                [serviceName]: serviceInstance
            };
            initializeController_1.default(controller, noOpDbManager, undefined, remoteServiceRootDir);
            exports.remoteServiceNameToControllerMap[`${topic}$/${serviceName}`] = controller;
        }
        const serviceFunctionArgumentClassName = controller[`${serviceName}__BackkTypes__`].functionNameToParamTypeNameMap[functionName];
        const ServiceFunctionArgumentClass = controller[serviceName].Types[serviceFunctionArgumentClassName];
        const instantiatedServiceFunctionArgument = class_transformer_1.plainToClass(ServiceFunctionArgumentClass, serviceFunctionArgument);
        try {
            await tryValidateServiceFunctionArgument_1.default(ServiceClass, functionName, noOpDbManager, instantiatedServiceFunctionArgument);
        }
        catch (error) {
            throw new Error(remoteServiceFunctionUrl +
                ': Invalid remote service function callRemoteService argument: ' +
                JSON.stringify(error.message));
        }
    });
}
exports.validateServiceFunctionArguments = validateServiceFunctionArguments;
//# sourceMappingURL=validateServiceFunctionArguments.js.map