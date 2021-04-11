import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
export default function getServiceFunctionExampleReturnValue(serviceTypes: {
    [key: string]: Function;
}, functionName: string, returnValueTypeName: string, serviceMetadata: ServiceMetadata, isUpdate?: boolean, previousUpdateSampleArg?: {
    [key: string]: any;
}, isRecursive?: boolean, isManyToMany?: boolean): object | undefined;
