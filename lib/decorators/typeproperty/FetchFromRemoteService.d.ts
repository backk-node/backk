import { HttpRequestOptions } from "../../remote/http/callRemoteService";
export declare function FetchFromRemoteService<T, U>(remoteServiceFunctionUrl: string, buildRemoteServiceFunctionArgument: (arg: T, response: U) => {
    [key: string]: any;
}, options?: HttpRequestOptions): (object: Object, propertyName: string) => void;
