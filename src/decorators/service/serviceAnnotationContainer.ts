class ServiceAnnotationContainer {
  private serviceClassNameToHasNoAutoTestsAnnotationMap: { [key: string]: boolean } = {};
  private serviceClassNameToIsAllowedForEveryUserMap: { [key: string]: boolean } = {};
  private serviceClassNameToIsAllowedForClusterInternalUseMap: { [key: string]: boolean } = {};
  private serviceClassNameToAllowedUserRolesMap: { [key: string]: string[] } = {};
  private serviceClassNameToDocStringMap: { [key: string]: string } = {};

  addNoAutoTestsAnnotationToServiceClass(serviceClass: Function) {
    this.serviceClassNameToHasNoAutoTestsAnnotationMap[serviceClass.name] = true;
  }

  addAllowedUserRolesForService(serviceClass: Function, roles: string[]) {
    this.serviceClassNameToAllowedUserRolesMap[serviceClass.name] = roles;
  }

  addServiceAllowedForEveryUser(serviceClass: Function) {
    this.serviceClassNameToIsAllowedForEveryUserMap[serviceClass.name] = true;
  }

  addServiceAllowedForClusterInternalUse(serviceClass: Function) {
    this.serviceClassNameToIsAllowedForClusterInternalUseMap[serviceClass.name] = true;
  }

  addDocumentationForService(serviceClass: Function, docString: string) {
    this.serviceClassNameToDocStringMap[serviceClass.name] = docString;
  }

  getAllowedUserRoles(serviceClass: Function) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceClassNameToAllowedUserRolesMap[proto.constructor.name] !== undefined) {
        return this.serviceClassNameToAllowedUserRolesMap[proto.constructor.name];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return [];
  }

  isServiceAllowedForEveryUser(serviceClass: Function) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceClassNameToIsAllowedForEveryUserMap[proto.constructor.name] !== undefined) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isServiceAllowedForClusterInternalUse(serviceClass: Function) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceClassNameToIsAllowedForClusterInternalUseMap[proto.constructor.name] !== undefined) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  hasNoAutoTestsAnnotationForServiceClass(serviceClass: Function) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceClassNameToHasNoAutoTestsAnnotationMap[proto.constructor.name] !== undefined) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  getDocumentationForService(serviceClass: Function) {
    let proto = Object.getPrototypeOf(new (serviceClass as new () => any)());
    while (proto !== Object.prototype) {
      if (this.serviceClassNameToDocStringMap[proto.constructor.name] !== undefined) {
        return this.serviceClassNameToDocStringMap[proto.constructor.name];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }
}

export default new ServiceAnnotationContainer();
