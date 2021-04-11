import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
export default function getServiceFunctionTestArgument(ServiceClass: Function, serviceTypes: {
    [key: string]: Function;
}, functionName: string, argTypeName: string, serviceMetadata: ServiceMetadata, isInitialUpdate?: boolean, updateCount?: number, previousUpdateSampleArg?: {
    [key: string]: any;
}, isRecursive?: boolean, isManyToMany?: boolean): object | undefined;
