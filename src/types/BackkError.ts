export type BackkError = {
  statusCode: number;
  message: string;
  errorCode?: string | number;
  stackTrace?: string;
};
