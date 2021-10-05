import createErrorFromErrorMessageAndThrowError from "../errors/createErrorFromErrorMessageAndThrowError";
import serviceAnnotationContainer from "../decorators/service/serviceAnnotationContainer";
import serviceFunctionAnnotationContainer
  from "../decorators/service/function/serviceFunctionAnnotationContainer";
import BaseService from "../service/BaseService";
import UserAccountBaseService from "../service/useraccount/UserAccountBaseService";
import createErrorMessageWithStatusCode from "../errors/createErrorMessageWithStatusCode";
import defaultServiceMetrics from "../observability/metrics/defaultServiceMetrics";
import { HttpStatusCodes } from "../constants/constants";
import { BACKK_ERRORS } from "../errors/backkErrors";

export default async function tryAuthorize(
  service: BaseService,
  functionName: string,
  serviceFunctionArgument: any,
  authHeader: string | string[] | undefined,
  authorizationService: any,
  usersService: UserAccountBaseService | undefined
): Promise<void | string> {
  const ServiceClass = service.constructor;

  if (!authorizationService) {
    throw new Error(
      'Authorization service missing. You must define an authorization service which is an instance of AuthorizationService in your MicroserviceImpl class '
    );
  }

  const serviceFunctionName = `${ServiceClass.name.charAt(0).toLowerCase() + ServiceClass.name.slice(1)}.${
    functionName
  }`;

  // TODO check that X-Original-Uri is not set to public URI for this microservice
  // TODO if authHeader is missing and X-Original-Uri is set, return 401 Unauthorized
  if (authHeader === undefined) {
    if (
      serviceAnnotationContainer.isServiceAllowedForClusterInternalUse(ServiceClass) ||
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
        ServiceClass,
        functionName)
    ) {
      return;
    }
  } else {
    if (
      serviceAnnotationContainer.isServiceAllowedForEveryUser(ServiceClass) ||
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUserForOwnResources(ServiceClass, functionName) ||
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUser(ServiceClass, functionName)
    ) {
      return;
    }

    let allowedRoles: string[] = [];
    allowedRoles = allowedRoles.concat(serviceAnnotationContainer.getAllowedUserRoles(ServiceClass));
    allowedRoles = allowedRoles.concat(
      serviceFunctionAnnotationContainer.getAllowedUserRoles(ServiceClass, functionName)
    );

    if (await authorizationService.hasUserRoleIn(allowedRoles, authHeader)) {
      return;
    }

  }

  if (
    process.env.NODE_ENV === 'development' &&
    (serviceFunctionAnnotationContainer.isServiceFunctionAllowedForTests(ServiceClass, functionName) ||
      serviceAnnotationContainer.isServiceAllowedForClusterInternalUse(ServiceClass) ||
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
        ServiceClass,
        functionName
      ))
  ) {
    return;
  }

  defaultServiceMetrics.incrementAuthorizationFailuresByOne();

  createErrorFromErrorMessageAndThrowError(
    createErrorMessageWithStatusCode(
      `Error code: ${BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED.errorCode}:${BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED.message}`,
      HttpStatusCodes.FORBIDDEN
    )
  );
}
