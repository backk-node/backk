import { HttpRequestOptions } from "../../remote/http/callRemoteService";
export declare type RemoteServiceFetchSpec = {
    remoteServiceFunctionUrl: string;
    buildRemoteServiceFunctionArgument: (arg: any, response: any) => {
        [key: string]: any;
    };
    options?: HttpRequestOptions;
};
declare class TypePropertyAnnotationContainer {
    private readonly typePropertyNameToDocStringMap;
    private readonly typePropertyNameToIsUniqueMap;
    private readonly typePropertyNameToIsNotHashedMap;
    private readonly typePropertyNameToIsHashedMap;
    private readonly typePropertyNameToIsEncryptedMap;
    private readonly typePropertyNameToIsNotEncryptedMap;
    private readonly typePropertyNameToIsPrivateMap;
    private readonly typePropertyNameToIsManyToManyMap;
    private readonly typePropertyNameToIsTransientMap;
    private readonly typePropertyNameToIsExternalIdMap;
    private readonly typePropertyNameToIsInternalMap;
    private readonly typePropertyNameToIsOneToManyMap;
    private readonly typePropertyNameToIsExternalServiceEntityMap;
    private readonly typePropertyNameToRemoteServiceFetchSpecMap;
    addDocumentationForTypeProperty(Type: Function, propertyName: string, docString: string): void;
    setTypePropertyAsUnique(Type: Function, propertyName: string): void;
    setTypePropertyAsNotHashed(Type: Function, propertyName: string): void;
    setTypePropertyAsHashed(Type: Function, propertyName: string): void;
    setTypePropertyAsEncrypted(Type: Function, propertyName: string): void;
    setTypePropertyAsNotEncrypted(Type: Function, propertyName: string): void;
    setTypePropertyAsPrivate(Type: Function, propertyName: string): void;
    setTypePropertyAsManyToMany(Type: Function, propertyName: string): void;
    setTypePropertyAsOneToMany(Type: Function, propertyName: string, isExternalServiceEntity: boolean): void;
    setTypePropertyAsTransient(Type: Function, propertyName: string): void;
    setTypePropertyAsExternalId(Type: Function, propertyName: string): void;
    setTypePropertyAsInternal(Type: Function, propertyName: string): void;
    setTypePropertyAsFetchedFromRemoteService(Type: Function, propertyName: string, remoteServiceFunctionUrl: string, buildRemoteServiceFunctionArgument: (arg: any, response: any) => {
        [key: string]: any;
    }, options?: HttpRequestOptions): void;
    getDocumentationForTypeProperty(Type: Function, propertyName: string): string | undefined;
    isTypePropertyUnique(Type: Function, propertyName: string): boolean;
    isTypePropertyNotHashed(Type: Function, propertyName: string): boolean;
    isTypePropertyHashed(Type: Function, propertyName: string): boolean;
    isTypePropertyEncrypted(Type: Function, propertyName: string): boolean;
    isTypePropertyNotEncrypted(Type: Function, propertyName: string): boolean;
    isTypePropertyPrivate(Type: Function, propertyName: string): boolean;
    isTypePropertyManyToMany(Type: Function | undefined, propertyName: string): boolean;
    isTypePropertyOneToMany(Type: Function | undefined, propertyName: string): boolean;
    isTypePropertyExternalServiceEntity(Type: Function | undefined, propertyName: string): boolean;
    isTypePropertyTransient(Type: Function, propertyName: string): boolean;
    isTypePropertyExternalId(Type: Function, propertyName: string): boolean;
    isTypePropertyInternal(Type: Function, propertyName: string): boolean;
    getTypePropertyRemoteServiceFetchSpec(Type: Function, propertyName: string): RemoteServiceFetchSpec | undefined;
}
declare const _default: TypePropertyAnnotationContainer;
export default _default;
