"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const createPostmanCollectionItemFromCustomTest_1 = __importDefault(require("./createPostmanCollectionItemFromCustomTest"));
const getServiceFunctionTestArgument_1 = __importDefault(require("./getServiceFunctionTestArgument"));
function addCustomTest(writtenTest, controller, servicesMetadata, items) {
    var _a;
    ((_a = writtenTest.tests) !== null && _a !== void 0 ? _a : [{}]).forEach((test) => {
        const instantiatedWrittenTest = lodash_1.default.cloneDeepWith(writtenTest, (value) => {
            let replacedValue = value;
            Object.entries(test.testProperties || {}).forEach(([testPropertyName, testPropertyValue]) => {
                if (replacedValue === `{{${testPropertyName}}}`) {
                    replacedValue = testPropertyValue;
                }
                if (typeof replacedValue === 'string' && replacedValue.includes(`{{${testPropertyName}}}`)) {
                    replacedValue = replacedValue.replace(`{{${testPropertyName}}}`, testPropertyValue);
                }
            });
            return replacedValue === value ? undefined : replacedValue;
        });
        const [serviceName, functionName] = instantiatedWrittenTest.testTemplate.serviceFunctionName.split('.');
        const serviceMetadata = servicesMetadata.find((serviceMetadata) => serviceMetadata.serviceName === serviceName);
        const functionMetadata = serviceMetadata === null || serviceMetadata === void 0 ? void 0 : serviceMetadata.functions.find((func) => func.functionName === functionName);
        if (!serviceMetadata || !functionMetadata) {
            throw new Error('Integration tests: unknown service function: ' +
                instantiatedWrittenTest.testTemplate.serviceFunctionName);
        }
        const sampleFunctionArgument = getServiceFunctionTestArgument_1.default(controller[serviceMetadata.serviceName].constructor, controller[serviceMetadata.serviceName].Types, functionMetadata.functionName, functionMetadata.argType, serviceMetadata);
        instantiatedWrittenTest.testTemplate.argument = {
            ...sampleFunctionArgument,
            ...(instantiatedWrittenTest.testTemplate.argument || {})
        };
        Object.keys(instantiatedWrittenTest.testTemplate.argument).forEach((argumentKey) => {
            let isArgumentTemplateReplaced = false;
            Object.entries(test.testProperties || {}).forEach(([key, value]) => {
                if (argumentKey === `{{${key}}}`) {
                    const argumentValue = instantiatedWrittenTest.testTemplate.argument[argumentKey];
                    delete instantiatedWrittenTest.testTemplate.argument[argumentKey];
                    instantiatedWrittenTest.testTemplate.argument[value] = argumentValue;
                    isArgumentTemplateReplaced = true;
                }
            });
            if (!isArgumentTemplateReplaced && argumentKey.startsWith('{{') && argumentKey.endsWith('}}')) {
                delete instantiatedWrittenTest.testTemplate.argument[argumentKey];
            }
        });
        instantiatedWrittenTest.testTemplate.testTemplateName = test.testName
            ? test.testName
            : instantiatedWrittenTest.testTemplate.serviceFunctionName;
        items.push(createPostmanCollectionItemFromCustomTest_1.default(instantiatedWrittenTest));
    });
}
exports.default = addCustomTest;
//# sourceMappingURL=addCustomTest.js.map