"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractSqlDbManager_1 = __importDefault(require("../../../AbstractSqlDbManager"));
let intervalId = undefined;
const RETRY_INTERVAL = 15000;
async function removeDbInitialization(dbManager) {
    if (process.env.NODE_ENV === 'development') {
        return;
    }
    if (!(dbManager instanceof AbstractSqlDbManager_1.default)) {
        const removeAppVersionSql = `DELETE FROM ${dbManager.schema.toLowerCase()}.__backk_db_initialization WHERE appversion =
    ${process.env.npm_package_version}`;
        try {
            await dbManager.tryExecuteSqlWithoutCls(removeAppVersionSql);
        }
        catch (error) {
            if (intervalId !== undefined) {
                clearInterval(intervalId);
            }
            intervalId = setInterval(() => removeDbInitialization(dbManager), RETRY_INTERVAL);
        }
    }
}
exports.default = removeDbInitialization;
//# sourceMappingURL=removeDbInitialization.js.map