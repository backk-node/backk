export declare const backkErrorSymbol: unique symbol;
export declare type BackkError = {
    [backkErrorSymbol]: true;
    statusCode: number;
    message: string;
    errorCode?: string;
    stackTrace?: string;
};
