"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getServiceName() {
    const cwd = process.cwd();
    return cwd.split('/').reverse()[0];
}
exports.default = getServiceName;
//# sourceMappingURL=getServiceName.js.map