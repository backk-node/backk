import { HttpRequestOptions } from "../../remote/http/callRemoteService";

export type RemoteServiceFetchSpec = {
  remoteMicroserviceName: string,
  remoteMicroserviceNamespace?: string,
  remoteServiceFunctionName: string,
  buildRemoteServiceFunctionArgument: (arg: any, response: any) => { [key: string]: any },
  options?: HttpRequestOptions
};

class TypePropertyAnnotationContainer {
  private readonly typePropertyNameToDocStringMap: { [key: string]: string } = {};
  private readonly typePropertyNameToIsUniqueMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsNotHashedMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsHashedMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsEncryptedMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsNotEncryptedMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsPrivateMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsManyToManyMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsExternalIdMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsOneToManyMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsExternalServiceEntityMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToRemoteServiceFetchSpecMap: { [key: string]: RemoteServiceFetchSpec } = {};
  private readonly typePropertyNameToIsNotUniqueMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsReadWriteMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsReadOnlyMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsWriteOnlyMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsCreateOnlyMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsUpdateOnlyMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsReadUpdateMap: { [key: string]: boolean } = {};
  private readonly typePropertyNameToIsTransientMap: { [key: string]: boolean } = {};

  addDocumentationForTypeProperty(Type: Function, propertyName: string, docString: string) {
    this.typePropertyNameToDocStringMap[`${Type.name}${propertyName}`] = docString;
  }

  setTypePropertyAsUnique(Type: Function, propertyName: string) {
    this.typePropertyNameToIsUniqueMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsNotUnique(Type: Function, propertyName: string) {
    this.typePropertyNameToIsNotUniqueMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsTransient(Type: Function, propertyName: string) {
    this.typePropertyNameToIsTransientMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsNotHashed(Type: Function, propertyName: string) {
    this.typePropertyNameToIsNotHashedMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsHashed(Type: Function, propertyName: string) {
    this.typePropertyNameToIsHashedMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsEncrypted(Type: Function, propertyName: string) {
    this.typePropertyNameToIsEncryptedMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsNotEncrypted(Type: Function, propertyName: string) {
    this.typePropertyNameToIsNotEncryptedMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsPrivate(Type: Function, propertyName: string) {
    this.typePropertyNameToIsPrivateMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsManyToMany(Type: Function, propertyName: string) {
    this.typePropertyNameToIsManyToManyMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsOneToMany(Type: Function, propertyName: string, isExternalServiceEntity: boolean) {
    this.typePropertyNameToIsOneToManyMap[`${Type.name}${propertyName}`] = true;
    this.typePropertyNameToIsExternalServiceEntityMap[
      `${Type.name}${propertyName}`
    ] = isExternalServiceEntity;
  }

  setTypePropertyAsExternalId(Type: Function, propertyName: string) {
    this.typePropertyNameToIsExternalIdMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsReadWrite(Type: Function, propertyName: string) {
    this.typePropertyNameToIsReadWriteMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsReadOnly(Type: Function, propertyName: string) {
    this.typePropertyNameToIsReadOnlyMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsWriteOnly(Type: Function, propertyName: string) {
    this.typePropertyNameToIsWriteOnlyMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsCreateOnly(Type: Function, propertyName: string) {
    this.typePropertyNameToIsCreateOnlyMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsUpdateOnly(Type: Function, propertyName: string) {
    this.typePropertyNameToIsUpdateOnlyMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsReadUpdate(Type: Function, propertyName: string) {
    this.typePropertyNameToIsReadUpdateMap[`${Type.name}${propertyName}`] = true;
  }

  setTypePropertyAsFetchedFromRemoteService(
    Type: Function,
    propertyName: string,
    remoteMicroserviceName: string,
    remoteMicroserviceNamespace: string | undefined,
    remoteServiceFunctionName: string,
    buildRemoteServiceFunctionArgument: (arg: any, response: any) => { [key: string]: any },
    options?: HttpRequestOptions
  ) {
    this.typePropertyNameToRemoteServiceFetchSpecMap[`${Type.name}${propertyName}`] = {
      remoteMicroserviceName,
      remoteMicroserviceNamespace,
      remoteServiceFunctionName,
      buildRemoteServiceFunctionArgument,
      options
    };
  }

  getDocumentationForTypeProperty(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToDocStringMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToDocStringMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }

  isTypePropertyTransient(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsTransientMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsTransientMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyUnique(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsUniqueMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsUniqueMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyNotUnique(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsNotUniqueMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsNotUniqueMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyNotHashed(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsNotHashedMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsNotHashedMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyHashed(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsHashedMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsHashedMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyEncrypted(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsEncryptedMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsEncryptedMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyNotEncrypted(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.typePropertyNameToIsNotEncryptedMap[`${proto.constructor.name}${propertyName}`] !== undefined
      ) {
        return this.typePropertyNameToIsNotEncryptedMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyPrivate(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsPrivateMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsPrivateMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyManyToMany(Type: Function | undefined, propertyName: string) {
    if (!Type) {
      return false;
    }

    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsManyToManyMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsManyToManyMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyOneToMany(Type: Function | undefined, propertyName: string) {
    if (!Type) {
      return false;
    }

    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsOneToManyMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsOneToManyMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyExternalServiceEntity(Type: Function | undefined, propertyName: string) {
    if (!Type) {
      return false;
    }

    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (
        this.typePropertyNameToIsExternalServiceEntityMap[`${proto.constructor.name}${propertyName}`] !==
        undefined
      ) {
        return this.typePropertyNameToIsExternalServiceEntityMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyExternalId(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsExternalIdMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsExternalIdMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyReadWrite(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsReadWriteMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsReadWriteMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyReadOnly(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsReadOnlyMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsReadOnlyMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyWriteOnly(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsWriteOnlyMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsWriteOnlyMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyCreateOnly(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsCreateOnlyMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsCreateOnlyMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyUpdateOnly(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsUpdateOnlyMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsUpdateOnlyMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  isTypePropertyReadUpdate(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToIsReadUpdateMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToIsReadUpdateMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return false;
  }

  getTypePropertyRemoteServiceFetchSpec(Type: Function, propertyName: string) {
    let proto = Object.getPrototypeOf(new (Type as new () => any)());
    while (proto !== Object.prototype) {
      if (this.typePropertyNameToRemoteServiceFetchSpecMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
        return this.typePropertyNameToRemoteServiceFetchSpecMap[`${proto.constructor.name}${propertyName}`];
      }
      proto = Object.getPrototypeOf(proto);
    }

    return undefined;
  }
}

export default new TypePropertyAnnotationContainer();
