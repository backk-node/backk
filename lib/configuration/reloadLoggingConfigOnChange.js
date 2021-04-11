"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function reloadLoggingConfigOnChange() {
    if (fs_1.default.existsSync('/etc/config/logging/LOG_LEVEL')) {
        fs_1.default.watchFile('/etc/config/logging/LOG_LEVEL', () => {
            try {
                const newLogLevel = fs_1.default.readFileSync('/etc/config/logging/LOG_LEVEL', { encoding: 'UTF-8' });
                process.env.LOG_LEVEL = newLogLevel.trim();
            }
            catch (error) {
            }
        });
    }
}
exports.default = reloadLoggingConfigOnChange;
//# sourceMappingURL=reloadLoggingConfigOnChange.js.map