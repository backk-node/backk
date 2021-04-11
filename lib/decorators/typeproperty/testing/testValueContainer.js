"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestValueContainer {
    constructor() {
        this.testValues = {};
        this.expectAnyTestValue = {};
        this.testValuesToEvaluateTrue = {};
    }
    addTestValue(type, propertyName, testValue) {
        this.testValues[`${type.name}${propertyName}`] = testValue;
    }
    addExpectTestValueToMatch(type, propertyName, func) {
        this.testValuesToEvaluateTrue[`${type.name}${propertyName}`] = func;
    }
    addExpectAnyTestValue(type, propertyName) {
        this.expectAnyTestValue[`${type.name}${propertyName}`] = true;
    }
    getTestValue(type, propertyName) {
        let proto = Object.getPrototypeOf(new type());
        while (proto !== Object.prototype) {
            if (this.testValues[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.testValues[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
    }
    getTestValueToEvaluateTrue(type, propertyName) {
        let proto = Object.getPrototypeOf(new type());
        while (proto !== Object.prototype) {
            if (this.testValuesToEvaluateTrue[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.testValuesToEvaluateTrue[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
    }
    getExpectAnyTestValue(type, propertyName) {
        let proto = Object.getPrototypeOf(new type());
        while (proto !== Object.prototype) {
            if (this.expectAnyTestValue[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.expectAnyTestValue[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
    }
}
exports.default = new TestValueContainer();
//# sourceMappingURL=testValueContainer.js.map