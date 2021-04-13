"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testValueContainer_1 = __importDefault(require("./testValueContainer"));
function TestValue(testValue) {
    return function (object, propertyName) {
        testValueContainer_1.default.addTestValue(object.constructor, propertyName, testValue);
    };
}
exports.default = TestValue;
//# sourceMappingURL=TestValue.js.map