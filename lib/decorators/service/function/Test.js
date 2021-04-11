"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function Test(expectedResult) {
    const finalFieldPathNameToFieldValueMap = Object.entries(expectedResult).reduce((finalFieldPathNameToFieldValueMap, [fieldPathName, fieldValue]) => {
        let finalFieldValue = fieldValue;
        if (typeof fieldValue === 'string' && fieldValue.startsWith('{{') && fieldValue.endsWith('}}')) {
            const idFieldName = fieldValue.slice(2, -2).trim();
            finalFieldValue = `pm.collectionVariables.get('${idFieldName}')`;
        }
        return {
            ...finalFieldPathNameToFieldValueMap,
            [fieldPathName]: finalFieldValue
        };
    }, {});
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.expectServiceFunctionReturnValueToContainInTests(object.constructor, functionName, finalFieldPathNameToFieldValueMap);
    };
}
exports.Test = Test;
//# sourceMappingURL=Test.js.map