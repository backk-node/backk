export declare type ErrorDefinition = {
    readonly errorCode: string;
    readonly message: string;
    readonly statusCode?: number;
};
export declare type ErrorDefinitions = {
    [key: string]: ErrorDefinition;
};
