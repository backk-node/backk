import { ErrorDef } from '../../../dbmanager/hooks/PreHook';
import { HttpHeaders } from './ResponseHeaders';
import { UpdateType } from './Update';
import { PostTestSpec } from './PostTests';
import { TestSetupSpec } from './TestSetup';

class ServiceFunctionAnnotationContainer {
  private readonly serviceFunctionNameToHasNoCaptchaAnnotationMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsAllowedForEveryUserMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsAllowedForClusterInternalUseMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsAllowedForSelfMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsAllowedForServicePrivateUseMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToAllowedUserRolesMap: { [key: string]: string[] } = {};
  private readonly serviceFunctionNameToDocStringMap: { [key: string]: string } = {};
  private readonly serviceFunctionNameToAllowedForTestsMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToErrorsMap: { [key: string]: ErrorDef[] } = {};
  private readonly serviceFunctionNameToIsNotTransactionalMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsNotDistributedTransactionalMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToCronScheduleMap: { [key: string]: string } = {};
  private readonly serviceFunctionNameToRetryIntervalsInSecsMap: { [key: string]: number[] } = {};
  private readonly serviceFunctionNameToUpdateTypeMap: { [key: string]: UpdateType } = {};
  private readonly serviceFunctionNameToResponseHeadersMap: { [key: string]: HttpHeaders<any, any> } = {};
  private readonly serviceFunctionNameToHasNoAutoTestMap: { [key: string]: boolean } = {};

  private readonly serviceFunctionNameToExpectedResponseFieldPathNameToFieldValueMapMap: {
    [key: string]: { [key: string]: any };
  } = {};

  private readonly serviceFunctionNameToPostTestSpecsMap: {
    [key: string]: PostTestSpec[];
  } = {};

  private readonly serviceFunctionNameToOnStartUpMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsCreateFunctionMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsMetadataFunctionMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToIsDeleteFunctionMap: { [key: string]: boolean } = {};
  private readonly serviceFunctionNameToResponseStatusCodeMap: { [key: string]: number } = {};
  private readonly serviceFunctionNameToTestSetupMap: { [key: string]: (string | TestSetupSpec)[] } = {};

  addNoCaptchaAnnotation(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToHasNoCaptchaAnnotationMap[`${serviceClass.name}${functionName}`] = true;
  }

  addAllowedUserRoles(serviceClass: Function, functionName: string, roles: string[]) {
    this.serviceFunctionNameToAllowedUserRolesMap[`${serviceClass.name}${functionName}`] = roles;
  }

  addServiceFunctionAllowedForEveryUser(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsAllowedForEveryUserMap[`${serviceClass.name}${functionName}`] = true;
  }

  addServiceFunctionAllowedForClusterInternalUse(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsAllowedForClusterInternalUseMap[`${serviceClass.name}${functionName}`] = true;
  }

  addServiceFunctionAllowedForSelf(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsAllowedForSelfMap[`${serviceClass.name}${functionName}`] = true;
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

  addErrorsForServiceFunction(serviceClass: Function, functionName: string, errors: ErrorDef[]) {
    this.serviceFunctionNameToErrorsMap[`${serviceClass.name}${functionName}`] = errors;
  }

  addNonTransactionalServiceFunction(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsNotTransactionalMap[`${serviceClass.name}${functionName}`] = true;
  }

  addNonDistributedTransactionalServiceFunction(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsNotDistributedTransactionalMap[`${serviceClass.name}${functionName}`] = true;
  }

  addCronScheduleForServiceFunction(serviceClass: Function, functionName: string, cronSchedule: string) {
    this.serviceFunctionNameToCronScheduleMap[
      `${serviceClass.name.charAt(0).toLowerCase() + serviceClass.name.slice(1)}.${functionName}`
    ] = cronSchedule;
  }

  addRetryIntervalsInSecsForServiceFunction(
    serviceClass: Function,
    functionName: string,
    retryIntervalsInSecs: number[]
  ) {
    this.serviceFunctionNameToRetryIntervalsInSecsMap[
      `${serviceClass.name.charAt(0).toLowerCase() + serviceClass.name.slice(1)}.${functionName}`
    ] = retryIntervalsInSecs;
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

  addMetadataFunctionAnnotation(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsMetadataFunctionMap[`${serviceClass.name}${functionName}`] = true;
  }

  addDeleteAnnotation(serviceClass: Function, functionName: string) {
    this.serviceFunctionNameToIsDeleteFunctionMap[`${serviceClass.name}${functionName}`] = true;
  }

  addTestSetup(
    serviceClass: Function,
    functionName: string,
    serviceFunctionsOrSpecsToExecute: (string | TestSetupSpec)[]
  ) {
    this.serviceFunctionNameToTestSetupMap[
      `${serviceClass.name}${functionName}`
    ] = serviceFunctionsOrSpecsToExecute;
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

  isServiceFunctionAllowedForSelf(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsAllowedForSelfMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
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

  isMetadataServiceFunction(serviceClass: Function, functionName: string) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.serviceFunctionNameToIsMetadataFunctionMap[`${proto.constructor.name}${functionName}`] !==
        undefined
      ) {
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
      if (this.serviceFunctionNameToPostTestSpecsMap[`${proto.constructor.name}${functionName}`] !== undefined) {
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
}

export default new ServiceFunctionAnnotationContainer();
