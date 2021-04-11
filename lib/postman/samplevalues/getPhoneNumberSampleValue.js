"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const examples_mobile_json_1 = __importDefault(require("libphonenumber-js/examples.mobile.json"));
const libphonenumber_js_1 = require("libphonenumber-js");
function getPhoneNumberSampleValue(locale) {
    var _a;
    const phoneNumber = libphonenumber_js_1.getExampleNumber(locale, examples_mobile_json_1.default);
    return (_a = phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.formatNational()) !== null && _a !== void 0 ? _a : 'Invalid phone number locale';
}
exports.default = getPhoneNumberSampleValue;
//# sourceMappingURL=getPhoneNumberSampleValue.js.map