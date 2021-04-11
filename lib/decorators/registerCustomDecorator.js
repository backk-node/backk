"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customDecoratorNameToTestValueMap = void 0;
const class_validator_1 = require("class-validator");
exports.customDecoratorNameToTestValueMap = {};
function registerCustomDecorator(options, testValue) {
    var _a;
    if (!options.name) {
        throw new Error('name must be specified in ValidationDecoratorOptions');
    }
    if (options.name !== ((_a = options.constraints) === null || _a === void 0 ? void 0 : _a[0])) {
        throw new Error("property 'name' and 'constraints[0]' must be same in ValidationDecoratorOptions");
    }
    exports.customDecoratorNameToTestValueMap[options.name] = testValue;
    class_validator_1.registerDecorator(options);
}
exports.default = registerCustomDecorator;
//# sourceMappingURL=registerCustomDecorator.js.map