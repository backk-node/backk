import { ErrorDefinition } from '../../../types/ErrorDefinition';
import { PostTestSpec } from './PostTests';
import { HttpHeaders } from './ResponseHeaders';
import { TestSetupSpec } from './TestSetup';
import { UpdateType } from './Update';

type AuditLog = {
  shouldLog: (argument: any, returnValue: any) => boolean;
  attributesToLog: (argument: any, returnValue: any) => { [key: string]: any };
};

class ServiceFunctionAnnotationContainer {
  private readonly serviceFunctionNameToHasNoCaptchaAnnotationMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsAllowedForEveryUserMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsAllowedForEveryUserWithAuthenticationMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsAllowedForClusterInternalUseMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToUserAccountIdFieldName: { [key: string]: string } = {};
  private readonly serviceFunctionNameToIsAllowedForServicePrivateUseMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToAllowedUserRolesMap: { [key: string]: string[] } = {};
  private readonly serviceFunctionNameToDocStringMap: { [key: string]: string } = {};
  private readonly serviceFunctionNameToAllowedForTestsMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToErrorsMap: { [key: string]: ErrorDefinition[] } = {};
  private readonly serviceFunctionNameToIsNotTransactionalMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsNotDistributedTransactionalMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToCronScheduleMap: { [key: string]: string } = {};
  private readonly serviceFunctionNameToRetryIntervalsInSecsMap: { [key: string]: number[] } = {};
  private readonly serviceFunctionNameToUpdateTypeMap: { [key: string]: UpdateType } = {};
  private readonly serviceFunctionNameToResponseHeadersMap: { [key: string]: HttpHeaders<any, any> } = {};
  private readonly serviceFunctionNameToHasNoAutoTestMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToAuditLogMap: { [key: string]: AuditLog } = {};
  private readonly serviceFunctionNameToAllowHttpGetMethodMap: { [key: string]: boolean } = {};

  private readonly serviceFunctionNameToExpectedResponseFieldPathNameToFieldValueMapMap: {
    [key: string]: { [key: string]: any };
  } = {};

  private readonly serviceFunctionNameToPostTestSpecsMap: {
    [key: string]: PostTestSpec[];
  } = {};

  private readonly serviceFunctionNameToOnStartUpMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsCreateFunctionMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsDeleteFunctionMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToResponseStatusCodeMap: { [key: string]: number } = {};
  private readonly serviceFunctionNameToTestSetupMap: { [key: string]: (string | TestSetupSpec)[] } = {};
  private readonly serviceFunctionNameToSubscriptionMap: { [key: string]: boolean } = {};

  addNoCaptchaAnnotation(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToHasNoCaptchaAnnotationMap[`${serviceClass.name}${functionName}`] = true;
  }

  addAllowedUserRoles(serviceClass: Function, functionName: string, roles: string[]) {
    this.serviceFunctionNameToAllowedUserRolesMap[`${serviceClass.name}${functionName}`] = roles;
  }

  addServiceFunctionAllowedForEveryUser(
    serviceClass: Function,
    functionName: string,
    allowDespiteUserIdInArg: boolean
  ) {
    this.serviceFunctionNameToIsAllowedForEveryUserMap[`${serviceClass.name}${functionName}`] =
      allowDespiteUserIdInArg;
  }

  addServiceFunctionAllowedForEveryUserWithAuthentication(
    serviceClass: Function,
    functionName: string,
    isAuthenticationRequired: boolean
  ) {
    this.serviceFunctionNameToIsAllowedForEveryUserWithAuthenticationMap[`${serviceClass.name}${functionName}`] =
      isAuthenticationRequired;
  }

  addServiceFunctionAllowedForClusterInternalUse(ServiceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsAllowedForClusterInternalUseMap[`${ServiceClass.name}${functionName}`] = true;
  }

  addServiceFunctionAllowHttpGetMethod(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToAllowHttpGetMethodMap[`${serviceClass.name}${functionName}`] = true;
  }

  addServiceFunctionAllowedForEveryUserForOwnResources(
    serviceClass: Function,
    functionName: string,
    userAccountIdFieldName: string
  ) {
    this.serviceFunctionNameToUserAccountIdFieldName[`${serviceClass.name}${functionName}`] =
      userAccountIdFieldName;
  }

  addServiceFunctionAllowedForServiceInternalUse(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsAllowedForServicePrivateUseMap[`${serviceClass.name}${functionName}`] = true;
  }

  addDocumentationForServiceFunction(serviceClass: Function, functionName: string, docString: string) {
    this.serviceFunctionNameToDocStringMap[`${serviceClass.name}${functionName}`] = docString;
  }

  addResponseStatusCodeForServiceFunction(serviceClass: Function, functionName: string, statusCode: number) {
    this.serviceFunctionNameToResponseStatusCodeMap[`${serviceClass.name}${functionName}`] = statusCode;
  }

  addServiceFunctionAllowedForTests(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToAllowedForTestsMap[`${serviceClass.name}${functionName}`] = true;
  }

  addErrorsForServiceFunction(serviceClass: Function, functionName: string, errors: ErrorDefinition[]) {
    this.serviceFunctionNameToErrorsMap[`${serviceClass.name}${functionName}`] = errors;
  }

  addNonTransactionalServiceFunction(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsNotTransactionalMap[`${serviceClass.name}${functionName}`] = true;
  }

  addNonDistributedTransactionalServiceFunction(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsNotDistributedTransactionalMap[`${serviceClass.name}${functionName}`] = true;
  }

  addCronScheduleForServiceFunction(ServiceClass: Function, functionName: string, cronSchedule: string) {
    this.serviceFunctionNameToCronScheduleMap[`${ServiceClass.name}.${functionName}`] = cronSchedule;
  }

  addRetryIntervalsInSecsForServiceFunction(
    ServiceClass: Function,
    functionName: string,
    retryIntervalsInSecs: number[]
  ) {
    this.serviceFunctionNameToRetryIntervalsInSecsMap[`${ServiceClass.name}.${functionName}`] = retryIntervalsInSecs;
  }

  addUpdateAnnotation(serviceClass: Function, functionName: string, updateType: UpdateType) {
    this.serviceFunctionNameToUpdateTypeMap[`${serviceClass.name}${functionName}`] = updateType;
  }

  addResponseHeadersForServiceFunction<T extends object, U extends any>(
    serviceClass: Function,
    functionName: string,
    headers: HttpHeaders<T, U>
  ) {
    this.serviceFunctionNameToResponseHeadersMap[`${serviceClass.name}${functionName}`] = headers;
  }

  addNoAutoTestAnnotation(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToHasNoAutoTestMap[`${serviceClass.name}${functionName}`] = true;
  }

  addOnStartUpAnnotation(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToOnStartUpMap[`${serviceClass.name}${functionName}`] = true;
  }

  addCreateAnnotation(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsCreateFunctionMap[`${serviceClass.name}${functionName}`] = true;
  }

  addDeleteAnnotation(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsDeleteFunctionMap[`${serviceClass.name}${functionName}`] = true;
  }

  addTestSetup(
    serviceClass: Function,
    functionName: string,
    serviceFunctionsOrSpecsToExecute: (string | TestSetupSpec)[]
  ) {
    this.serviceFunctionNameToTestSetupMap[`${serviceClass.name}${functionName}`] =
      serviceFunctionsOrSpecsToExecute;
  }

  addServiceFunctionAuditLog(
    serviceClass: Function,
    functionName: string,
    shouldLog: (argument: any, returnValue: any) => boolean,
    attributesToLog: (argument: any, returnValue: any) => { [key: string]: any }
  ) {
    this.serviceFunctionNameToAuditLogMap[`${serviceClass.name}${functionName}`] = {
      shouldLog,
      attributesToLog,
    };
  }

  addSubscription(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToSubscriptionMap[`${serviceClass.name}${functionName}`] = true;
  }

  expectServiceFunctionReturnValueToContainInTests(
    serviceClass: Function,
    functionName: string,
    fieldPathNameToFieldValueMap: { [key: string]: any }
  ) {
    this.serviceFunctionNameToExpectedResponseFieldPathNameToFieldValueMapMap[
      `${serviceClass.name}${functionName}`
    ] = fieldPathNameToFieldValueMap;
  }

  expectServiceFunctionEntityToContainInTests(
    serviceClass: Function,
    functionName: string,
    testSpecs: PostTestSpec[]
  ) {
    this.serviceFunctionNameToPostTestSpecsMap[`${serviceClass.name}${functionName}`] = testSpecs;
  }

  getAllowedUserRoles(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToAllowedUserRolesMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return this.serviceFunctionNameToAllowedUserRolesMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return [];
  }

  isServiceFunctionAllowedForEveryUser(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsAllowedForEveryUserMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isServiceFunctionAllowedForEveryUserWithAuthentication(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsAllowedForEveryUserWithAuthenticationMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return this.serviceFunctionNameToIsAllowedForEveryUserWithAuthenticationMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  isServiceFunctionAllowedForEveryUserDespiteOfUserIdInArg(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsAllowedForEveryUserMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return this.serviceFunctionNameToIsAllowedForEveryUserMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  isServiceFunctionAllowedForClusterInternalUse(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsAllowedForClusterInternalUseMap[
          `${proto.constructor.name}${functionName}`
        ] !== undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isServiceFunctionAllowedForEveryUserForOwnResources(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToUserAccountIdFieldName[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return this.serviceFunctionNameToUserAccountIdFieldName[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  isServiceFunctionAllowedForServiceInternalUse(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsAllowedForServicePrivateUseMap[
          `${proto.constructor.name}${functionName}`
        ] !== undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  hasNoCaptchaAnnotationForServiceFunction(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToHasNoCaptchaAnnotationMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  getDocumentationForServiceFunction(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceFunctionNameToDocStringMap[`${proto.constructor.name}${functionName}`] !== undefined) {
        return this.serviceFunctionNameToDocStringMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  getResponseStatusCodeForServiceFunction(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToResponseStatusCodeMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return this.serviceFunctionNameToResponseStatusCodeMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  isServiceFunctionAllowedForTests(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToAllowedForTestsMap[`${proto.constructor.name}${functionName}`] !== undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  getErrorsForServiceFunction(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceFunctionNameToErrorsMap[`${proto.constructor.name}${functionName}`] !== undefined) {
        return this.serviceFunctionNameToErrorsMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  isServiceFunctionNonTransactional(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsNotTransactionalMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  doesServiceFunctionAllowHttpGetMethod(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToAllowHttpGetMethodMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isServiceFunctionNonDistributedTransactional(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsNotDistributedTransactionalMap[
          `${proto.constructor.name}${functionName}`
        ] !== undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  getUpdateTypeForServiceFunction(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceFunctionNameToUpdateTypeMap[`${proto.constructor.name}${functionName}`] !== undefined) {
        return this.serviceFunctionNameToUpdateTypeMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  isCreateServiceFunction(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsCreateFunctionMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isDeleteServiceFunction(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsDeleteFunctionMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
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

  getResponseHeadersForServiceFunction<T extends object, U extends any>(
    serviceClass: Function,
    functionName: string
  ): HttpHeaders<T, U> | undefined {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToResponseHeadersMap[`${proto.constructor.name}${functionName}`] !== undefined
      ) {
        return this.serviceFunctionNameToResponseHeadersMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  hasNoAutoTests(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToHasNoAutoTestMap[`${proto.constructor.name}${functionName}`] !== undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  hasOnStartUp(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceFunctionNameToOnStartUpMap[`${proto.constructor.name}${functionName}`] !== undefined) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  getExpectedResponseValueFieldPathNameToFieldValueMapForTests(
    serviceClass: Function,
    functionName: string
  ): { [key: string]: any } | undefined {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToExpectedResponseFieldPathNameToFieldValueMapMap[
          `${proto.constructor.name}${functionName}`
        ] !== undefined
      ) {
        return this.serviceFunctionNameToExpectedResponseFieldPathNameToFieldValueMapMap[
          `${proto.constructor.name}${functionName}`
        ];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  getPostTestSpecs(serviceClass: Function, functionName: string): PostTestSpec[] | undefined {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToPostTestSpecsMap[`${proto.constructor.name}${functionName}`] !== undefined
      ) {
        return this.serviceFunctionNameToPostTestSpecsMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  getTestSetup(serviceClass: Function, functionName: string): (string | TestSetupSpec)[] | undefined {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceFunctionNameToTestSetupMap[`${proto.constructor.name}${functionName}`] !== undefined) {
        return this.serviceFunctionNameToTestSetupMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  getAuditLog(serviceClass: Function, functionName: string): AuditLog | undefined {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceFunctionNameToAuditLogMap[`${proto.constructor.name}${functionName}`] !== undefined) {
        return this.serviceFunctionNameToAuditLogMap[`${proto.constructor.name}${functionName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  isSubscription(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToSubscriptionMap[`${proto.constructor.name}${functionName}`] !== undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }
}

export default new ServiceFunctionAnnotationContainer();
