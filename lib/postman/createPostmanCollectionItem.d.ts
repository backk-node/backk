import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
export default function createPostmanCollectionItem(ServiceClass: Function, serviceMetadata: ServiceMetadata, functionMetadata: FunctionMetadata, sampleArg: object | undefined, tests?: object, itemName?: string, sampleResponse?: object, isArrayResponse?: boolean): {
    name: string;
    request: {
        description: {
            content: string;
            type: string;
        };
        method: string;
        header: {
            key: string;
            name: string;
            value: string;
            type: string;
        }[];
        body: {
            mode: string;
            raw: string;
            options: {
                raw: {
                    language: string;
                };
            };
        } | undefined;
        url: {
            raw: string;
            protocol: string;
            host: string[];
            port: string;
            path: string[];
        };
    };
    response: never[];
    event: object[] | undefined;
};
