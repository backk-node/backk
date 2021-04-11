export default function getTypeDocumentation<T>(typeMetadata: {
    [key: string]: string;
} | undefined, TypeClass: new () => T): {
    [key: string]: string;
};
