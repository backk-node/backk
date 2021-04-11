export declare enum Severity {
    DEBUG = 5,
    INFO = 9,
    WARN = 13,
    ERROR = 17,
    FATAL = 21
}
export declare const severityNameToSeverityMap: {
    [key: string]: number;
};
export default function log(severityNumber: Severity, name: string, body: string, attributes?: {
    [key: string]: string | number | boolean | undefined | object[];
}): void;
export declare function logError(error: Error): void;
