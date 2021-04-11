export default function createPostmanCollectionItemFromCustomTest({ testTemplate: { testTemplateName, serviceFunctionName, argument, responseStatusCode, responseTests } }: any): {
    name: any;
    request: {
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
            path: any[];
        };
    };
    response: never[];
    event: {
        id: any;
        listen: string;
        script: {
            id: any;
            exec: any[];
        };
    }[];
};
