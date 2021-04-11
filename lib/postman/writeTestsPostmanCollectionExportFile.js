"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getSrcFilePathNameForTypeName_1 = require("../utils/file/getSrcFilePathNameForTypeName");
const lodash_1 = __importDefault(require("lodash"));
const yaml_1 = __importDefault(require("yaml"));
const fs_1 = require("fs");
const serviceAnnotationContainer_1 = __importDefault(require("../decorators/service/serviceAnnotationContainer"));
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../decorators/service/function/serviceFunctionAnnotationContainer"));
const jsonwebtoken_1 = require("jsonwebtoken");
const js_base64_1 = require("js-base64");
const getServiceFunctionTests_1 = __importDefault(require("./getServiceFunctionTests"));
const getServiceFunctionTestArgument_1 = __importDefault(require("./getServiceFunctionTestArgument"));
const createPostmanCollectionItem_1 = __importDefault(require("./createPostmanCollectionItem"));
const addCustomTest_1 = __importDefault(require("./addCustomTest"));
const isReadFunction_1 = __importDefault(require("../service/crudentity/utils/isReadFunction"));
const isUpdateFunction_1 = __importDefault(require("../service/crudentity/utils/isUpdateFunction"));
const isDeleteFunction_1 = __importDefault(require("../service/crudentity/utils/isDeleteFunction"));
const tryValidateIntegrationTests_1 = __importDefault(require("./tryValidateIntegrationTests"));
const constants_1 = require("../constants/constants");
const isCreateFunction_1 = __importDefault(require("../service/crudentity/utils/isCreateFunction"));
const CrudEntityService_1 = __importDefault(require("../service/crudentity/CrudEntityService"));
const path_1 = __importDefault(require("path"));
function writeTestsPostmanCollectionExportFile(controller, servicesMetadata) {
    let items = [];
    const itemGroups = [];
    const testFilePathNames = getSrcFilePathNameForTypeName_1.getFileNamesRecursively(process.cwd() + '/integrationtests');
    const writtenTests = lodash_1.default.flatten(testFilePathNames.map((testFilePathName) => {
        const testFileContents = fs_1.readFileSync(testFilePathName, { encoding: 'UTF-8' });
        const fileType = testFilePathName.endsWith('json') ? 'json' : 'yaml';
        const writtenTestsInFile = fileType === 'json' ? JSON.parse(testFileContents) : yaml_1.default.parse(testFileContents);
        return Array.isArray(writtenTestsInFile)
            ? writtenTestsInFile.map((writtenTest) => ({
                ...writtenTest,
                serviceName: path_1.default.basename(path_1.default.dirname(testFilePathName)),
                testFileName: path_1.default.basename(testFilePathName).split('.')[0]
            }))
            : [];
    }));
    tryValidateIntegrationTests_1.default(writtenTests, servicesMetadata);
    servicesMetadata
        .filter((serviceMetadata) => controller[serviceMetadata.serviceName] instanceof CrudEntityService_1.default)
        .forEach((serviceMetadata) => {
        const foundDeleteAllFunction = serviceMetadata.functions.find((func) => func.functionName.startsWith('deleteAll') ||
            func.functionName.startsWith('destroyAll') ||
            func.functionName.startsWith('eraseAll'));
        if (foundDeleteAllFunction) {
            const tests = getServiceFunctionTests_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, serviceMetadata, foundDeleteAllFunction, false);
            const sampleArg = getServiceFunctionTestArgument_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, foundDeleteAllFunction.functionName, foundDeleteAllFunction.argType, serviceMetadata, false);
            const item = createPostmanCollectionItem_1.default(controller[serviceMetadata.serviceName].constructor, serviceMetadata, foundDeleteAllFunction, sampleArg, tests);
            items.push(item);
        }
    });
    itemGroups.push({
        name: 'Cleanup (0)',
        item: items.map((item, index) => ({ ...item, name: item.name + ` (0.${index + 1})` }))
    });
    servicesMetadata.forEach((serviceMetadata, serviceIndex) => {
        const functionItemGroups = [];
        let updateCount = 0;
        if (serviceAnnotationContainer_1.default.hasNoAutoTestsAnnotationForServiceClass(controller[serviceMetadata.serviceName].constructor)) {
            return;
        }
        let lastReadFunctionMetadata;
        let createFunctionMetadata;
        serviceMetadata.functions.forEach((functionMetadata, functionIndex) => {
            items = [];
            writtenTests
                .filter(({ testTemplate: { before, executeLast } }) => !executeLast &&
                (before === null || before === void 0 ? void 0 : before.toLowerCase()) ===
                    (serviceMetadata.serviceName + '.' + functionMetadata.functionName).toLowerCase())
                .forEach((writtenTest) => {
                addCustomTest_1.default(writtenTest, controller, servicesMetadata, items);
            });
            if (serviceFunctionAnnotationContainer_1.default.hasNoAutoTests(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName) ||
                serviceFunctionAnnotationContainer_1.default.hasOnStartUp(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName) ||
                serviceFunctionAnnotationContainer_1.default.isMetadataServiceFunction(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName)) {
                return;
            }
            const testSetupServiceFunctionsOrSpecsToExecute = serviceFunctionAnnotationContainer_1.default.getTestSetup(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName);
            testSetupServiceFunctionsOrSpecsToExecute === null || testSetupServiceFunctionsOrSpecsToExecute === void 0 ? void 0 : testSetupServiceFunctionsOrSpecsToExecute.forEach((serviceFunctionOrSpec, testSpecIndex) => {
                const [serviceName, functionName] = typeof serviceFunctionOrSpec === 'string'
                    ? serviceFunctionOrSpec.split('.')
                    : serviceFunctionOrSpec.serviceFunctionName.split('.');
                const foundServiceMetadata = servicesMetadata.find((serviceMetadata) => serviceMetadata.serviceName === serviceName);
                const foundFunctionMetadata = foundServiceMetadata === null || foundServiceMetadata === void 0 ? void 0 : foundServiceMetadata.functions.find((func) => func.functionName === functionName);
                if (!foundServiceMetadata || !foundFunctionMetadata) {
                    throw new Error('Invalid service function name in @TestSetup annotation in ' +
                        serviceMetadata.serviceName +
                        '.' +
                        functionMetadata.functionName);
                }
                const expectedResponseStatusCode = serviceFunctionAnnotationContainer_1.default.getResponseStatusCodeForServiceFunction(controller[foundServiceMetadata.serviceName].constructor, foundFunctionMetadata.functionName);
                const expectedResponseFieldPathNameToFieldValueMapInTests = serviceFunctionAnnotationContainer_1.default.getExpectedResponseValueFieldPathNameToFieldValueMapForTests(controller[foundServiceMetadata.serviceName].constructor, foundFunctionMetadata.functionName);
                let tests;
                if (typeof serviceFunctionOrSpec === 'string' ||
                    (typeof serviceFunctionOrSpec === 'object' && !serviceFunctionOrSpec.postmanTests)) {
                    tests = getServiceFunctionTests_1.default(controller[foundServiceMetadata.serviceName].constructor, controller[foundServiceMetadata.serviceName].Types, foundServiceMetadata, foundFunctionMetadata, false, expectedResponseStatusCode, expectedResponseFieldPathNameToFieldValueMapInTests);
                }
                else if (serviceFunctionOrSpec.postmanTests) {
                    tests = {
                        id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
                        listen: 'test',
                        script: {
                            id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
                            exec: [
                                'const response = pm.response.json();',
                                ...serviceFunctionOrSpec.postmanTests.map((test) => `pm.test("test", function () {
  ${test} 
})`)
                            ]
                        }
                    };
                }
                const sampleArg = getServiceFunctionTestArgument_1.default(controller[foundServiceMetadata.serviceName].constructor, controller[foundServiceMetadata.serviceName].Types, foundFunctionMetadata.functionName, foundFunctionMetadata.argType, foundServiceMetadata, false);
                const item = createPostmanCollectionItem_1.default(controller[foundServiceMetadata.serviceName].constructor, foundServiceMetadata, foundFunctionMetadata, typeof serviceFunctionOrSpec === 'object' && serviceFunctionOrSpec.argument
                    ? { ...sampleArg, ...serviceFunctionOrSpec.argument }
                    : sampleArg, tests, typeof serviceFunctionOrSpec === 'object' ? serviceFunctionOrSpec === null || serviceFunctionOrSpec === void 0 ? void 0 : serviceFunctionOrSpec.setupStepName : undefined);
                items.push({ ...item, name: (testSpecIndex === 0 ? 'GIVEN ' : 'AND ') + item.name });
            });
            const isCreate = isCreateFunction_1.default(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName);
            if (isCreate) {
                createFunctionMetadata = functionMetadata;
            }
            if (isReadFunction_1.default(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName)) {
                lastReadFunctionMetadata = functionMetadata;
            }
            const expectedResponseStatusCode = serviceFunctionAnnotationContainer_1.default.getResponseStatusCodeForServiceFunction(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName);
            const expectedResponseFieldPathNameToFieldValueMapInTests = serviceFunctionAnnotationContainer_1.default.getExpectedResponseValueFieldPathNameToFieldValueMapForTests(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName);
            if (isUpdateFunction_1.default(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName)) {
                updateCount++;
            }
            const updateType = serviceFunctionAnnotationContainer_1.default.getUpdateTypeForServiceFunction(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName);
            const isUpdate = isUpdateFunction_1.default(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName);
            const isDelete = isDeleteFunction_1.default(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName);
            if (isDelete &&
                functionIndex !== 0 &&
                isDeleteFunction_1.default(controller[serviceMetadata.serviceName].constructor, serviceMetadata.functions[functionIndex - 1].functionName) &&
                createFunctionMetadata &&
                !testSetupServiceFunctionsOrSpecsToExecute) {
                const createFunctionTests = getServiceFunctionTests_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, serviceMetadata, createFunctionMetadata, false, undefined, expectedResponseFieldPathNameToFieldValueMapInTests);
                const createFunctionSampleArg = getServiceFunctionTestArgument_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, createFunctionMetadata.functionName, createFunctionMetadata.argType, serviceMetadata);
                items.push(createPostmanCollectionItem_1.default(controller[serviceMetadata.serviceName].constructor, serviceMetadata, createFunctionMetadata, createFunctionSampleArg, createFunctionTests));
            }
            const sampleArg = getServiceFunctionTestArgument_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, functionMetadata.functionName, functionMetadata.argType, serviceMetadata, isUpdate, updateCount);
            const tests = getServiceFunctionTests_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, serviceMetadata, functionMetadata, false, expectedResponseStatusCode, expectedResponseFieldPathNameToFieldValueMapInTests);
            const item = createPostmanCollectionItem_1.default(controller[serviceMetadata.serviceName].constructor, serviceMetadata, functionMetadata, sampleArg, tests);
            const postTestSpecs = serviceFunctionAnnotationContainer_1.default.getPostTestSpecs(controller[serviceMetadata.serviceName].constructor, functionMetadata.functionName);
            let hasWrittenTest = false;
            writtenTests
                .filter(({ testTemplate: { serviceFunctionName, type, at, executeLast } }) => !executeLast &&
                type === 'when' &&
                at.toLowerCase() ===
                    (serviceMetadata.serviceName + '.' + functionMetadata.functionName).toLowerCase())
                .forEach((writtenTest) => {
                hasWrittenTest = true;
                addCustomTest_1.default(writtenTest, controller, servicesMetadata, items);
            });
            if (postTestSpecs || (isDelete && lastReadFunctionMetadata)) {
                items.push({ ...item, name: 'WHEN ' + item.name });
            }
            else if (!hasWrittenTest) {
                items.push(item);
            }
            postTestSpecs === null || postTestSpecs === void 0 ? void 0 : postTestSpecs.forEach((postTestSpec, testSpecIndex) => {
                var _a, _b;
                const finalExpectedFieldPathNameToFieldValueMapInTests = {
                    ...(expectedResponseFieldPathNameToFieldValueMapInTests !== null && expectedResponseFieldPathNameToFieldValueMapInTests !== void 0 ? expectedResponseFieldPathNameToFieldValueMapInTests : {}),
                    ...((_a = postTestSpec === null || postTestSpec === void 0 ? void 0 : postTestSpec.expectedResult) !== null && _a !== void 0 ? _a : {})
                };
                if (postTestSpec === null || postTestSpec === void 0 ? void 0 : postTestSpec.serviceFunctionName) {
                    const [serviceName, functionName] = postTestSpec.serviceFunctionName.split('.');
                    const foundServiceMetadata = servicesMetadata.find((serviceMetadata) => serviceMetadata.serviceName === serviceName);
                    const foundFunctionMetadata = foundServiceMetadata === null || foundServiceMetadata === void 0 ? void 0 : foundServiceMetadata.functions.find((func) => func.functionName === functionName);
                    if (!foundServiceMetadata || !foundFunctionMetadata) {
                        throw new Error('Invalid service function name in @PostTest annotation in ' +
                            serviceMetadata.serviceName +
                            '.' +
                            functionMetadata.functionName);
                    }
                    const expectedResponseStatusCode = serviceFunctionAnnotationContainer_1.default.getResponseStatusCodeForServiceFunction(controller[foundServiceMetadata.serviceName].constructor, foundFunctionMetadata.functionName);
                    const postTests = getServiceFunctionTests_1.default(controller[foundServiceMetadata.serviceName].constructor, controller[foundServiceMetadata.serviceName].Types, foundServiceMetadata, foundFunctionMetadata, isUpdate, expectedResponseStatusCode, finalExpectedFieldPathNameToFieldValueMapInTests, isUpdate ? sampleArg : undefined);
                    const postSampleArg = (_b = postTestSpec.argument) !== null && _b !== void 0 ? _b : getServiceFunctionTestArgument_1.default(controller[foundServiceMetadata.serviceName].constructor, controller[foundServiceMetadata.serviceName].Types, foundFunctionMetadata.functionName, foundFunctionMetadata.argType, foundServiceMetadata, true, 1, isUpdate ? sampleArg : undefined);
                    const item = createPostmanCollectionItem_1.default(controller[foundServiceMetadata.serviceName].constructor, foundServiceMetadata, foundFunctionMetadata, postSampleArg, postTests, postTestSpec.testName);
                    items.push({ ...item, name: (testSpecIndex === 0 ? 'THEN ' : 'AND ') + item.name });
                }
            });
            if (lastReadFunctionMetadata && (isUpdate || isDelete)) {
                const foundReadFunctionTestSpec = postTestSpecs === null || postTestSpecs === void 0 ? void 0 : postTestSpecs.find((postTestSpec) => {
                    const [serviceName, functionName] = postTestSpec.serviceFunctionName.split('.');
                    if (serviceName === serviceMetadata.serviceName &&
                        functionName === (lastReadFunctionMetadata === null || lastReadFunctionMetadata === void 0 ? void 0 : lastReadFunctionMetadata.functionName)) {
                        return true;
                    }
                    return false;
                });
                const foundAfterReadTest = writtenTests
                    .filter(({ testTemplate: { after, executeLast } }) => !executeLast &&
                    (after === null || after === void 0 ? void 0 : after.toLowerCase()) ===
                        (serviceMetadata.serviceName + '.' + (functionMetadata === null || functionMetadata === void 0 ? void 0 : functionMetadata.functionName)).toLowerCase())
                    .find(({ testTemplate: { serviceFunctionName } }) => {
                    if (serviceFunctionName === serviceMetadata.serviceName + '.' + (lastReadFunctionMetadata === null || lastReadFunctionMetadata === void 0 ? void 0 : lastReadFunctionMetadata.functionName)) {
                        return true;
                    }
                    return false;
                });
                if (((isUpdate && (updateType === 'update' || updateType === undefined)) || isDelete) &&
                    !foundReadFunctionTestSpec &&
                    !foundAfterReadTest) {
                    const getFunctionTests = getServiceFunctionTests_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, serviceMetadata, lastReadFunctionMetadata, isUpdate, isUpdate ? constants_1.HttpStatusCodes.SUCCESS : constants_1.HttpStatusCodes.NOT_FOUND, expectedResponseFieldPathNameToFieldValueMapInTests, isUpdate ? sampleArg : undefined);
                    const getFunctionSampleArg = getServiceFunctionTestArgument_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, lastReadFunctionMetadata.functionName, lastReadFunctionMetadata.argType, serviceMetadata, true, 1, sampleArg);
                    const itemName = lodash_1.default.startCase(serviceMetadata.serviceName.split('Service')[0]).toLowerCase();
                    const item = createPostmanCollectionItem_1.default(controller[serviceMetadata.serviceName].constructor, serviceMetadata, lastReadFunctionMetadata, getFunctionSampleArg, getFunctionTests, isDelete ? `THEN ${itemName} is not found` : undefined);
                    items.push(item);
                }
            }
            writtenTests
                .filter(({ testTemplate: { after, executeLast } }) => !executeLast &&
                (after === null || after === void 0 ? void 0 : after.toLowerCase()) ===
                    (serviceMetadata.serviceName + '.' + functionMetadata.functionName).toLowerCase())
                .forEach((writtenTest) => {
                addCustomTest_1.default(writtenTest, controller, servicesMetadata, items);
            });
            functionItemGroups.push({
                name: functionMetadata.functionName + ` (${serviceIndex + 1}.${functionIndex + 1})`,
                item: items.map((item, index) => ({
                    ...item,
                    name: item.name + ` (${serviceIndex + 1}.${functionIndex + 1}.${index + 1})`
                }))
            });
        });
        const customTestGroups = lodash_1.default.groupBy(writtenTests.filter(({ serviceName, testTemplate: { executeLast } }) => serviceName.toLowerCase() === serviceMetadata.serviceName.toLowerCase() && executeLast), ({ testFileName }) => testFileName);
        Object.entries(customTestGroups).forEach(([testFileName, writtenTests]) => {
            const customTestItems = [];
            writtenTests.forEach((writtenTest) => addCustomTest_1.default(writtenTest, controller, servicesMetadata, customTestItems));
            functionItemGroups.push({
                name: testFileName,
                item: customTestItems
            });
        });
        itemGroups.push({
            name: serviceMetadata.serviceName + ` (${serviceIndex + 1})`,
            item: functionItemGroups
        });
    });
    const cwd = process.cwd();
    const appName = cwd.split('/').reverse()[0];
    const jwt = jsonwebtoken_1.sign({ userName: 'abc', roles: [process.env.TEST_USER_ROLE] }, process.env.JWT_SIGN_SECRET || 'abcdef');
    const postmanMetadata = {
        info: {
            name: appName + ' tests',
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
            ...itemGroups
        ]
    };
    if (!fs_1.existsSync(cwd + '/postman')) {
        fs_1.mkdirSync(cwd + '/postman');
    }
    fs_1.writeFileSync(process.cwd() + '/postman/' + appName.replace(/-/g, '_') + '_tests_postman_collection.json', JSON.stringify(postmanMetadata, null, 4));
}
exports.default = writeTestsPostmanCollectionExportFile;
//# sourceMappingURL=writeTestsPostmanCollectionExportFile.js.map