import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
export default function getServiceFunctionReturnValueTests(serviceTypes: {
    [key: string]: Function;
}, returnValueTypeName: string, serviceMetadata: ServiceMetadata, responsePath: string, isOptional: boolean, isUpdate: boolean, sampleArg: object | undefined, expectedResponseFieldPathNameToFieldValueMapInTests: {
    [key: string]: any;
} | undefined, isRecursive?: boolean, isManyToMany?: boolean, fieldPath?: string): string[];
