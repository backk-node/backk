import { validateOrReject } from 'class-validator';
import createErrorFromErrorMessageAndThrowError from '../errors/createErrorFromErrorMessageAndThrowError';
import createErrorMessageWithStatusCode from '../errors/createErrorMessageWithStatusCode';
import { plainToClass } from 'class-transformer';
import getValidationErrors from './getValidationErrors';
import { HttpStatusCodes } from '../constants/constants';
import log, { Severity } from "../observability/logging/log";

export default async function tryValidateServiceFunctionReturnValue(
  returnValue: object,
  ReturnValueType: new () => any,
  serviceFunctionName: string
) {
  const instantiatedResponse = plainToClass(ReturnValueType, returnValue);

  try {
    await validateOrReject(instantiatedResponse, {
      groups: ['__backk_response__'],
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true
    });
  } catch (validationErrors) {
    const errorMessage = serviceFunctionName + ': Invalid service function return value: ' + getValidationErrors(validationErrors);

    log(Severity.ERROR, errorMessage, '');

    createErrorFromErrorMessageAndThrowError(
      createErrorMessageWithStatusCode(errorMessage, HttpStatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
}
