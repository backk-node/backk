export const backkErrorSymbol = Symbol();

export type BackkError = {
  [backkErrorSymbol]: true,
  statusCode: number;
  message: string;
  errorCode?: string;
  stackTrace?: string;
};
