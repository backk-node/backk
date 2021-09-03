import NodeCache from 'node-cache';
import createErrorFromErrorMessageAndThrowError from '../errors/createErrorFromErrorMessageAndThrowError';
import serviceAnnotationContainer from '../decorators/service/serviceAnnotationContainer';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import BaseService from '../service/BaseService';
import UserAccountBaseService from '../service/useraccount/UserAccountBaseService';
import createErrorMessageWithStatusCode from '../errors/createErrorMessageWithStatusCode';
import defaultServiceMetrics from '../observability/metrics/defaultServiceMetrics';
import { HttpStatusCodes } from '../constants/constants';
import { BACKK_ERRORS } from '../errors/backkErrors';

const subjectCache = new NodeCache({
  useClones: false,
  checkperiod: 5 * 60,
  stdTTL: 30 * 60,
  maxKeys: 100000
});

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

  // TODO check that X-Original-Uri is not set to public URI for this microservice
  // TODO if authHeader is missing and X-Original-Uri is set, return 401 Unauthorized
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
      let subject = serviceFunctionArgument.subject;

      const userAccountId =
        serviceFunctionArgument.userAccountId ||
        (service.isUsersService() ? serviceFunctionArgument._id : undefined);

      if (!userAccountId && !subject) {
        throw new Error(
          ServiceClass.name +
            '.' +
            functionName +
            ': must have userAccountId or subject property present in function argument'
        );
      }

      if (!subject && userAccountId) {
        if (!usersService) {
          throw new Error(
            'User account service is missing. You must implement a captcha verification service class that extends UserAccountBaseService and instantiate your class and store in a field in MicroserviceImpl class'
          );
        }

        let userAccount;
        if (subjectCache.has(userAccountId)) {
          userAccount = subjectCache.get(userAccountId);
        } else {
          userAccount = await usersService.getSubjectById(userAccountId);
          try {
            subjectCache.set(userAccountId, (userAccount as any).data.subject);
          } catch {
            // No operation
          }
        }

        if (userAccount) {
          subject = (userAccount as any).data.subject;
        }
      }

      if (await authorizationService.areSameIdentities(subject, authHeader)) {
        return subject;
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
