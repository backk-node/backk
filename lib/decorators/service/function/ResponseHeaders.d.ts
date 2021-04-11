export declare type HeaderValueGenerator<T extends object, U extends any> = (argument: T, returnValue: U) => string | undefined;
export declare type HttpHeaders<T extends object, U extends any> = {
    [key: string]: string | HeaderValueGenerator<T, U> | undefined;
};
export declare function ResponseHeaders<T extends object, U extends any>(headers: HttpHeaders<T, U>): (object: Object, functionName: string) => void;
