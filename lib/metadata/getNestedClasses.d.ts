export default function getNestedClasses(classNames: string[], Types: {
    [key: string]: new () => any;
}, PublicTypes: {
    [key: string]: new () => any;
}, remoteServiceRootDir?: string): void;
