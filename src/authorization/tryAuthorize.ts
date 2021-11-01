import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import serviceAnnotationContainer from '../decorators/service/serviceAnnotationContainer';
import { BACKK_ERRORS } from '../errors/backkErrors';
import createBackkErrorFromErrorCodeMessageAndStatus from '../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import defaultServiceMetrics from '../observability/metrics/defaultServiceMetrics';
import BaseService from '../services/BaseService';
import UserBaseService from '../services/useraccount/UserBaseService';

export default async function tryAuthorize(
  service: BaseService,
  functionName: string,
  serviceFunctionArgument: any,
  authHeader: string | string[] | undefined,
  authorizationService: any,
  usersService: UserBaseService | undefined,
  isClusterInternalCall: boolean
): Promise<[string | undefined, string | undefined]> {
  const ServiceClass = service.constructor;

  if (!authorizationService) {
    throw new Error(
      'Authorization service missing. You must define an authorization service which is an instance of AuthorizationService in your MicroserviceImpl class '
    );
  }

  if (authHeader === undefined) {
    if (isClusterInternalCall) {
      if (
        serviceAnnotationContainer.isServiceAllowedForClusterInternalUse(ServiceClass) ||
        serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
          ServiceClass,
          functionName
        )
      ) {
        return [undefined, undefined];
      }
    } else {
      throw createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.USER_NOT_AUTHENTICATED);
    }
  } else {
    if (
      serviceAnnotationContainer.isServiceAllowedForEveryUser(ServiceClass) ||
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUserForOwnResources(
        ServiceClass,
        functionName
      ) ||
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUser(ServiceClass, functionName)
    ) {
      const [subject, issuer] = await authorizationService.getSubjectAndIssuer(authHeader);
      if (subject && issuer) {
        return [subject, issuer];
      }
    }

    let allowedRoles: string[] = [];
    allowedRoles = allowedRoles.concat(serviceAnnotationContainer.getAllowedUserRoles(ServiceClass));
    allowedRoles = allowedRoles.concat(
      serviceFunctionAnnotationContainer.getAllowedUserRoles(ServiceClass, functionName)
    );

    if (await authorizationService.hasUserRoleIn(allowedRoles, authHeader)) {
      return [undefined, undefined];
    }
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    (serviceFunctionAnnotationContainer.isServiceFunctionAllowedForTests(ServiceClass, functionName) ||
      serviceAnnotationContainer.isServiceAllowedForClusterInternalUse(ServiceClass) ||
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
        ServiceClass,
        functionName
      ))
  ) {
    return [undefined, undefined];
  }

  defaultServiceMetrics.incrementAuthorizationFailuresByOne();
  throw createBackkErrorFromErrorCodeMessageAndStatus(BACKK_ERRORS.SERVICE_FUNCTION_CALL_NOT_AUTHORIZED);
}
