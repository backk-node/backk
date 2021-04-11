export default function parseRemoteServiceFunctionCallUrlParts(remoteServiceUrl: string): {
    scheme: string;
    server: string;
    topic: string;
    serviceFunctionName: string;
};
