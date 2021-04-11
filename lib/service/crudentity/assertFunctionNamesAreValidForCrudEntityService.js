"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isCreateFunction_1 = __importDefault(require("./utils/isCreateFunction"));
const isReadFunction_1 = __importDefault(require("./utils/isReadFunction"));
const isUpdateFunction_1 = __importDefault(require("./utils/isUpdateFunction"));
const isDeleteFunction_1 = __importDefault(require("./utils/isDeleteFunction"));
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../../decorators/service/function/serviceFunctionAnnotationContainer"));
function assertFunctionNamesAreValidForCrudEntityService(ServiceClass, functionNames) {
    return functionNames.forEach((functionName) => {
        if (!isCreateFunction_1.default(ServiceClass, functionName) &&
            !isReadFunction_1.default(ServiceClass, functionName) &&
            !isUpdateFunction_1.default(ServiceClass, functionName) &&
            !isDeleteFunction_1.default(ServiceClass, functionName) &&
            !serviceFunctionAnnotationContainer_1.default.hasOnStartUp(ServiceClass, functionName)) {
            throw new Error('Invalid function name: ' +
                ServiceClass.name +
                '.' +
                functionName +
                `\n
      Follow CrudResourceService naming conventions:
      - Create function names must start with create or insert
      - Read function names must start with get, read, find, fetch, retrieve, obtain
      - Update function names must start with update, modify, change, patch
      - Delete function names must start with delete, erase, destroy
      Alternatively, annotate functions with one of following: @Create(), @Read(), @Update(), @Delete()
      `);
        }
    });
}
exports.default = assertFunctionNamesAreValidForCrudEntityService;
//# sourceMappingURL=assertFunctionNamesAreValidForCrudEntityService.js.map