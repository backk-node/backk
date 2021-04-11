export default function decryptEntities<T extends {
    [key: string]: any;
}>(entities: T[], EntityClass: new () => T, Types: object, shouldDecryptManyToMany?: boolean): void;
