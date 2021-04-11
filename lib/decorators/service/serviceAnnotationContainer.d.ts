declare class ServiceAnnotationContainer {
    private serviceClassNameToHasNoAutoTestsAnnotationMap;
    private serviceClassNameToIsAllowedForEveryUserMap;
    private serviceClassNameToIsAllowedForClusterInternalUseMap;
    private serviceClassNameToAllowedUserRolesMap;
    private serviceClassNameToDocStringMap;
    addNoAutoTestsAnnotationToServiceClass(serviceClass: Function): void;
    addAllowedUserRolesForService(serviceClass: Function, roles: string[]): void;
    addServiceAllowedForEveryUser(serviceClass: Function): void;
    addServiceAllowedForClusterInternalUse(serviceClass: Function): void;
    addDocumentationForService(serviceClass: Function, docString: string): void;
    getAllowedUserRoles(serviceClass: Function): string[];
    isServiceAllowedForEveryUser(serviceClass: Function): boolean;
    isServiceAllowedForClusterInternalUse(serviceClass: Function): boolean;
    hasNoAutoTestsAnnotationForServiceClass(serviceClass: Function): boolean;
    getDocumentationForService(serviceClass: Function): string | undefined;
}
declare const _default: ServiceAnnotationContainer;
export default _default;
