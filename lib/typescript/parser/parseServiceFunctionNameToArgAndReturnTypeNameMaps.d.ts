export default function parseServiceFunctionNameToArgAndReturnTypeNameMaps(ServiceClass: Function, serviceName: string, serviceFileName: string, remoteServiceRootDir?: string): [string | undefined, {
    [key: string]: string;
}, {
    [key: string]: string;
}, {
    [key: string]: string;
}];
