"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceFunctionAnnotationContainer {
    constructor() {
        this.serviceFunctionNameToHasNoCaptchaAnnotationMap = {};
        this.serviceFunctionNameToIsAllowedForEveryUserMap = {};
        this.serviceFunctionNameToIsAllowedForClusterInternalUseMap = {};
        this.serviceFunctionNameToIsAllowedForSelfMap = {};
        this.serviceFunctionNameToIsAllowedForServicePrivateUseMap = {};
        this.serviceFunctionNameToAllowedUserRolesMap = {};
        this.serviceFunctionNameToDocStringMap = {};
        this.serviceFunctionNameToAllowedForTestsMap = {};
        this.serviceFunctionNameToErrorsMap = {};
        this.serviceFunctionNameToIsNotTransactionalMap = {};
        this.serviceFunctionNameToIsNotDistributedTransactionalMap = {};
        this.serviceFunctionNameToCronScheduleMap = {};
        this.serviceFunctionNameToRetryIntervalsInSecsMap = {};
        this.serviceFunctionNameToUpdateTypeMap = {};
        this.serviceFunctionNameToResponseHeadersMap = {};
        this.serviceFunctionNameToHasNoAutoTestMap = {};
        this.serviceFunctionNameToExpectedResponseFieldPathNameToFieldValueMapMap = {};
        this.serviceFunctionNameToPostTestSpecsMap = {};
        this.serviceFunctionNameToOnStartUpMap = {};
        this.serviceFunctionNameToIsCreateFunctionMap = {};
        this.serviceFunctionNameToIsMetadataFunctionMap = {};
        this.serviceFunctionNameToIsDeleteFunctionMap = {};
        this.serviceFunctionNameToResponseStatusCodeMap = {};
        this.serviceFunctionNameToTestSetupMap = {};
    }
    addNoCaptchaAnnotation(serviceClass, functionName) {
        this.serviceFunctionNameToHasNoCaptchaAnnotationMap[`${serviceClass.name}${functionName}`] = true;
    }
    addAllowedUserRoles(serviceClass, functionName, roles) {
        this.serviceFunctionNameToAllowedUserRolesMap[`${serviceClass.name}${functionName}`] = roles;
    }
    addServiceFunctionAllowedForEveryUser(serviceClass, functionName) {
        this.serviceFunctionNameToIsAllowedForEveryUserMap[`${serviceClass.name}${functionName}`] = true;
    }
    addServiceFunctionAllowedForClusterInternalUse(serviceClass, functionName) {
        this.serviceFunctionNameToIsAllowedForClusterInternalUseMap[`${serviceClass.name}${functionName}`] = true;
    }
    addServiceFunctionAllowedForSelf(serviceClass, functionName) {
        this.serviceFunctionNameToIsAllowedForSelfMap[`${serviceClass.name}${functionName}`] = true;
    }
    addServiceFunctionAllowedForServiceInternalUse(serviceClass, functionName) {
        this.serviceFunctionNameToIsAllowedForServicePrivateUseMap[`${serviceClass.name}${functionName}`] = true;
    }
    addDocumentationForServiceFunction(serviceClass, functionName, docString) {
        this.serviceFunctionNameToDocStringMap[`${serviceClass.name}${functionName}`] = docString;
    }
    addResponseStatusCodeForServiceFunction(serviceClass, functionName, statusCode) {
        this.serviceFunctionNameToResponseStatusCodeMap[`${serviceClass.name}${functionName}`] = statusCode;
    }
    addServiceFunctionAllowedForTests(serviceClass, functionName) {
        this.serviceFunctionNameToAllowedForTestsMap[`${serviceClass.name}${functionName}`] = true;
    }
    addErrorsForServiceFunction(serviceClass, functionName, errors) {
        this.serviceFunctionNameToErrorsMap[`${serviceClass.name}${functionName}`] = errors;
    }
    addNonTransactionalServiceFunction(serviceClass, functionName) {
        this.serviceFunctionNameToIsNotTransactionalMap[`${serviceClass.name}${functionName}`] = true;
    }
    addNonDistributedTransactionalServiceFunction(serviceClass, functionName) {
        this.serviceFunctionNameToIsNotDistributedTransactionalMap[`${serviceClass.name}${functionName}`] = true;
    }
    addCronScheduleForServiceFunction(serviceClass, functionName, cronSchedule) {
        this.serviceFunctionNameToCronScheduleMap[`${serviceClass.name.charAt(0).toLowerCase() + serviceClass.name.slice(1)}.${functionName}`] = cronSchedule;
    }
    addRetryIntervalsInSecsForServiceFunction(serviceClass, functionName, retryIntervalsInSecs) {
        this.serviceFunctionNameToRetryIntervalsInSecsMap[`${serviceClass.name.charAt(0).toLowerCase() + serviceClass.name.slice(1)}.${functionName}`] = retryIntervalsInSecs;
    }
    addUpdateAnnotation(serviceClass, functionName, updateType) {
        this.serviceFunctionNameToUpdateTypeMap[`${serviceClass.name}${functionName}`] = updateType;
    }
    addResponseHeadersForServiceFunction(serviceClass, functionName, headers) {
        this.serviceFunctionNameToResponseHeadersMap[`${serviceClass.name}${functionName}`] = headers;
    }
    addNoAutoTestAnnotation(serviceClass, functionName) {
        this.serviceFunctionNameToHasNoAutoTestMap[`${serviceClass.name}${functionName}`] = true;
    }
    addOnStartUpAnnotation(serviceClass, functionName) {
        this.serviceFunctionNameToOnStartUpMap[`${serviceClass.name}${functionName}`] = true;
    }
    addCreateAnnotation(serviceClass, functionName) {
        this.serviceFunctionNameToIsCreateFunctionMap[`${serviceClass.name}${functionName}`] = true;
    }
    addMetadataFunctionAnnotation(serviceClass, functionName) {
        this.serviceFunctionNameToIsMetadataFunctionMap[`${serviceClass.name}${functionName}`] = true;
    }
    addDeleteAnnotation(serviceClass, functionName) {
        this.serviceFunctionNameToIsDeleteFunctionMap[`${serviceClass.name}${functionName}`] = true;
    }
    addTestSetup(serviceClass, functionName, serviceFunctionsOrSpecsToExecute) {
        this.serviceFunctionNameToTestSetupMap[`${serviceClass.name}${functionName}`] = serviceFunctionsOrSpecsToExecute;
    }
    expectServiceFunctionReturnValueToContainInTests(serviceClass, functionName, fieldPathNameToFieldValueMap) {
        this.serviceFunctionNameToExpectedResponseFieldPathNameToFieldValueMapMap[`${serviceClass.name}${functionName}`] = fieldPathNameToFieldValueMap;
    }
    expectServiceFunctionEntityToContainInTests(serviceClass, functionName, testSpecs) {
        this.serviceFunctionNameToPostTestSpecsMap[`${serviceClass.name}${functionName}`] = testSpecs;
    }
    getAllowedUserRoles(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToAllowedUserRolesMap[`${proto.constructor.name}${functionName}`] !==
                undefined) {
                return this.serviceFunctionNameToAllowedUserRolesMap[`${proto.constructor.name}${functionName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return [];
    }
    isServiceFunctionAllowedForEveryUser(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToIsAllowedForEveryUserMap[`${proto.constructor.name}${functionName}`] !==
                undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isServiceFunctionAllowedForClusterInternalUse(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToIsAllowedForClusterInternalUseMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isServiceFunctionAllowedForSelf(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToIsAllowedForSelfMap[`${proto.constructor.name}${functionName}`] !==
                undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isServiceFunctionAllowedForServiceInternalUse(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToIsAllowedForServicePrivateUseMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    hasNoCaptchaAnnotationForServiceFunction(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToHasNoCaptchaAnnotationMap[`${proto.constructor.name}${functionName}`] !==
                undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    getDocumentationForServiceFunction(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToDocStringMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return this.serviceFunctionNameToDocStringMap[`${proto.constructor.name}${functionName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
    getResponseStatusCodeForServiceFunction(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToResponseStatusCodeMap[`${proto.constructor.name}${functionName}`] !==
                undefined) {
                return this.serviceFunctionNameToResponseStatusCodeMap[`${proto.constructor.name}${functionName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
    isServiceFunctionAllowedForTests(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToAllowedForTestsMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    getErrorsForServiceFunction(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToErrorsMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return this.serviceFunctionNameToErrorsMap[`${proto.constructor.name}${functionName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
    isServiceFunctionNonTransactional(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToIsNotTransactionalMap[`${proto.constructor.name}${functionName}`] !==
                undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isServiceFunctionNonDistributedTransactional(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToIsNotDistributedTransactionalMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    getUpdateTypeForServiceFunction(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToUpdateTypeMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return this.serviceFunctionNameToUpdateTypeMap[`${proto.constructor.name}${functionName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
    isCreateServiceFunction(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToIsCreateFunctionMap[`${proto.constructor.name}${functionName}`] !==
                undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isDeleteServiceFunction(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToIsDeleteFunctionMap[`${proto.constructor.name}${functionName}`] !==
                undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    getServiceFunctionNameToCronScheduleMap() {
        return this.serviceFunctionNameToCronScheduleMap;
    }
    getServiceFunctionNameToRetryIntervalsInSecsMap() {
        return this.serviceFunctionNameToRetryIntervalsInSecsMap;
    }
    getResponseHeadersForServiceFunction(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToResponseHeadersMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return this.serviceFunctionNameToResponseHeadersMap[`${proto.constructor.name}${functionName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
    hasNoAutoTests(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToHasNoAutoTestMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    hasOnStartUp(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToOnStartUpMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isMetadataServiceFunction(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToIsMetadataFunctionMap[`${proto.constructor.name}${functionName}`] !==
                undefined) {
                return true;
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    getExpectedResponseValueFieldPathNameToFieldValueMapForTests(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToExpectedResponseFieldPathNameToFieldValueMapMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return this.serviceFunctionNameToExpectedResponseFieldPathNameToFieldValueMapMap[`${proto.constructor.name}${functionName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
    getPostTestSpecs(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToPostTestSpecsMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return this.serviceFunctionNameToPostTestSpecsMap[`${proto.constructor.name}${functionName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
    getTestSetup(serviceClass, functionName) {
        let proto = Object.getPrototypeOf(new serviceClass());
        while (proto !== Object.prototype) {
            if (this.serviceFunctionNameToTestSetupMap[`${proto.constructor.name}${functionName}`] !== undefined) {
                return this.serviceFunctionNameToTestSetupMap[`${proto.constructor.name}${functionName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
}
exports.default = new ServiceFunctionAnnotationContainer();
//# sourceMappingURL=serviceFunctionAnnotationContainer.js.map