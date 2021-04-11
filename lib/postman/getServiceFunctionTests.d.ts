import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
export default function getServiceFunctionTests(ServiceClass: Function, serviceTypes: {
    [key: string]: Function;
}, serviceMetadata: ServiceMetadata, functionMetadata: FunctionMetadata, isUpdate: boolean, expectedResponseStatusCode?: number, expectedResponseFieldPathNameToFieldValueMapInTests?: {
    [key: string]: any;
} | undefined, sampleArg?: object | undefined): object | undefined;
