export default function getTypePropertyModifiers<T>(typeMetadata: {
    [key: string]: string;
} | undefined, Class: new () => T): {
    [key: string]: string;
};
