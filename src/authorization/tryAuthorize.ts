import createErrorFromErrorMessageAndThrowError from '../errors/createErrorFromErrorMessageAndThrowError';
import serviceAnnotationContainer from '../decorators/service/serviceAnnotationContainer';
import AuthorizationService from './AuthorizationService';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import BaseService from '../service/BaseService';
import UserAccountBaseService from '../service/useraccount/UserAccountBaseService';
import createErrorMessageWithStatusCode from '../errors/createErrorMessageWithStatusCode';
import defaultServiceMetrics from '../observability/metrics/defaultServiceMetrics';
import { HttpStatusCodes } from '../constants/constants';
import { BACKK_ERRORS } from '../errors/backkErrors';

export default async function tryAuthorize(
  service: BaseService,
  functionName: string,
  serviceFunctionArgument: any,
  authHeader: string | undefined,
  authorizationService: any,
  usersService: UserAccountBaseService | undefined
): Promise<void | string> {
  const ServiceClass = service.constructor;

  if (!authorizationService || !(authorizationService instanceof AuthorizationService)) {
    throw new Error('Authorization service missing');
  }

  if (authHeader === undefined) {
    if (
      serviceAnnotationContainer.isServiceAllowedForClusterInternalUse(ServiceClass) ||
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
        ServiceClass,
        functionName
      )
    ) {
      return;
    }
  } else {
    if (
      serviceAnnotationContainer.isServiceAllowedForEveryUser(ServiceClass) ||
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

    if (
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForSelf(ServiceClass, functionName) &&
      serviceFunctionArgument
    ) {
      let userName = serviceFunctionArgument.userName;

      const userId =
        serviceFunctionArgument.userId ||
        (service.isUsersService() ? serviceFunctionArgument._id : undefined);

      if (!userId && !userName) {
        throw new Error(
          ServiceClass.name +
            '.' +
            functionName +
            ': must have userId or userName property present in function argument'
        );
      }

      if (!userName && userId && usersService) {
        const [userAccount] = await usersService.getUserNameById(userId);

        if (userAccount) {
          userName = userAccount.userName;
        }
      }

      if (await authorizationService.areSameIdentities(userName, authHeader)) {
        return userName;
      }
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
