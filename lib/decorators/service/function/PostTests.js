"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function PostTests(testSpecs) {
    testSpecs.forEach(testSpec => {
        testSpec.expectedResult = Object.entries(testSpec.expectedResult).reduce((finalExpectedResult, [fieldPathName, fieldValue]) => {
            let finalFieldValue = fieldValue;
            if (typeof fieldValue === 'string' && fieldValue.startsWith('{{') && fieldValue.endsWith('}}')) {
                const idFieldName = fieldValue.slice(2, -2).trim();
                finalFieldValue = `pm.collectionVariables.get('${idFieldName}')`;
            }
            return {
                ...finalExpectedResult,
                [fieldPathName]: finalFieldValue
            };
        }, {});
    });
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.expectServiceFunctionEntityToContainInTests(object.constructor, functionName, testSpecs);
    };
}
exports.default = PostTests;
//# sourceMappingURL=PostTests.js.map