export const getDefaultOrThrowExceptionInProduction = (
  errorOrErrorMessage: string | Error,
  defaultValue = 'ABCDEFGH'
): string | never => {
  if (process.env.NODE_ENV !== 'production') {
    return defaultValue;
  }

  if (typeof errorOrErrorMessage === 'string') {
    throw new Error(errorOrErrorMessage);
  }

  throw errorOrErrorMessage;
};
