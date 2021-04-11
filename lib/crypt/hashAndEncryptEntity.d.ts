export default function hashAndEncryptEntity<T extends {
    [key: string]: any;
}>(entity: T, EntityClass: new () => T, Types: object): Promise<void>;
