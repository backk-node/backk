export default function getRemoteResponseTestValue<T>(ResponseClass: new () => T, types?: {
    [key: string]: new () => any;
}): {
    [key: string]: any;
};
