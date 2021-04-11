"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getControllerService(controller, ServiceClass) {
    return Object.values(controller).find((service) => service instanceof ServiceClass);
}
exports.default = getControllerService;
//# sourceMappingURL=getControllerService.js.map