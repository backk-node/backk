"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceAnnotationContainer {
    constructor() {
        this.serviceClassNameToHasNoAutoTestsAnnotationMap = {};
        this.serviceClassNameToIsAllowedForEveryUserMap = {};
        this.serviceClassNameToIsAllowedForClusterInternalUseMap = {};
        this.serviceClassNameToAllowedUserRolesMap = {};
        this.serviceClassNameToDocStringMap = {};
    }
    addNoAutoTestsAnnotationToServiceClass(serviceClass) {
        this.serviceClassNameToHasNoAutoTestsAnnotationMap[serviceClass.name] = true;
    }
    addAllowedUserRolesForService(serviceClass, roles) {
        this.serviceClassNameToAllowedUserRolesMap[serviceClass.name] = roles;
    }
    addServiceAllowedForEveryUser(serviceClass) {
        this.serviceClassNameToIsAllowedForEveryUserMap[serviceClass.name] = true;
    }
    addServiceAllowedForClusterInternalUse(serviceClass) {
        this.serviceClassNameToIsAllowedForClusterInternalUseMap[serviceClass.name] = true;
    }
    addDocumentationForService(serviceClass, docString) {
        this.serviceClassNameToDocStringMap[serviceClass.name] = docString;
    }
    getAllowedUserRoles(serviceClass) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceClassNameToAllowedUserRolesMap[proto.constructor.name] !== undefined) {
                return this.serviceClassNameToAllowedUserRolesMap[proto.constructor.name];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return [];
    }
    isServiceAllowedForEveryUser(serviceClass) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceClassNameToIsAllowedForEveryUserMap[proto.constructor.name] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isServiceAllowedForClusterInternalUse(serviceClass) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceClassNameToIsAllowedForClusterInternalUseMap[proto.constructor.name] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    hasNoAutoTestsAnnotationForServiceClass(serviceClass) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceClassNameToHasNoAutoTestsAnnotationMap[proto.constructor.name] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    getDocumentationForService(serviceClass) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceClassNameToDocStringMap[proto.constructor.name] !== undefined) {
                return this.serviceClassNameToDocStringMap[proto.constructor.name];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
}
exports.default = new ServiceAnnotationContainer();
//# sourceMappingURL=serviceAnnotationContainer.js.map