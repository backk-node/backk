import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
export default function getSetCollectionVariableStatements(entityName: string, typeName: string, serviceMetadata: ServiceMetadata, types: {
    [key: string]: Function;
}, responsePath: string): string[];
