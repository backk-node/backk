"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createErrorFromErrorMessageAndThrowError_1 = __importDefault(require("../errors/createErrorFromErrorMessageAndThrowError"));
const createErrorMessageWithStatusCode_1 = __importDefault(require("../errors/createErrorMessageWithStatusCode"));
async function tryVerifyCaptchaToken(controller, captchaToken) {
    var _a;
    if ((_a = controller['captchaVerifyService']) === null || _a === void 0 ? void 0 : _a['verifyCaptcha']) {
        const isCaptchaVerified = await controller['captchaVerifyService']['verifyCaptcha'](captchaToken);
        if (!isCaptchaVerified) {
            createErrorFromErrorMessageAndThrowError_1.default(createErrorMessageWithStatusCode_1.default('Invalid captcha token', 400));
        }
    }
    else {
        throw new Error('captchaVerifierService is missing');
    }
}
exports.default = tryVerifyCaptchaToken;
//# sourceMappingURL=tryVerifyCaptchaToken.js.map