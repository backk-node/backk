export const getDefaultOrThrowExceptionInProduction = (error: string | Error): string | never => {
  if (process.env.NODE_ENV !== 'production') {
    return 'ABCDEFGH';
  }

  if (typeof error === 'string') {
    throw new Error(error);
  }

  throw error;
};
