"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TypePropertyAnnotationContainer {
    constructor() {
        this.typePropertyNameToDocStringMap = {};
        this.typePropertyNameToIsUniqueMap = {};
        this.typePropertyNameToIsNotHashedMap = {};
        this.typePropertyNameToIsHashedMap = {};
        this.typePropertyNameToIsEncryptedMap = {};
        this.typePropertyNameToIsNotEncryptedMap = {};
        this.typePropertyNameToIsPrivateMap = {};
        this.typePropertyNameToIsManyToManyMap = {};
        this.typePropertyNameToIsTransientMap = {};
        this.typePropertyNameToIsExternalIdMap = {};
        this.typePropertyNameToIsInternalMap = {};
        this.typePropertyNameToIsOneToManyMap = {};
        this.typePropertyNameToIsExternalServiceEntityMap = {};
        this.typePropertyNameToRemoteServiceFetchSpecMap = {};
    }
    addDocumentationForTypeProperty(Type, propertyName, docString) {
        this.typePropertyNameToDocStringMap[`${Type.name}${propertyName}`] = docString;
    }
    setTypePropertyAsUnique(Type, propertyName) {
        this.typePropertyNameToIsUniqueMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsNotHashed(Type, propertyName) {
        this.typePropertyNameToIsNotHashedMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsHashed(Type, propertyName) {
        this.typePropertyNameToIsHashedMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsEncrypted(Type, propertyName) {
        this.typePropertyNameToIsEncryptedMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsNotEncrypted(Type, propertyName) {
        this.typePropertyNameToIsNotEncryptedMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsPrivate(Type, propertyName) {
        this.typePropertyNameToIsPrivateMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsManyToMany(Type, propertyName) {
        this.typePropertyNameToIsManyToManyMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsOneToMany(Type, propertyName, isExternalServiceEntity) {
        this.typePropertyNameToIsOneToManyMap[`${Type.name}${propertyName}`] = true;
        this.typePropertyNameToIsExternalServiceEntityMap[`${Type.name}${propertyName}`] = isExternalServiceEntity;
    }
    setTypePropertyAsTransient(Type, propertyName) {
        this.typePropertyNameToIsTransientMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsExternalId(Type, propertyName) {
        this.typePropertyNameToIsExternalIdMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsInternal(Type, propertyName) {
        this.typePropertyNameToIsInternalMap[`${Type.name}${propertyName}`] = true;
    }
    setTypePropertyAsFetchedFromRemoteService(Type, propertyName, remoteServiceFunctionUrl, buildRemoteServiceFunctionArgument, options) {
        this.typePropertyNameToRemoteServiceFetchSpecMap[`${Type.name}${propertyName}`] = {
            remoteServiceFunctionUrl,
            buildRemoteServiceFunctionArgument,
            options
        };
    }
    getDocumentationForTypeProperty(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToDocStringMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToDocStringMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
    isTypePropertyUnique(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsUniqueMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsUniqueMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyNotHashed(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsNotHashedMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsNotHashedMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyHashed(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsHashedMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsHashedMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyEncrypted(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsEncryptedMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsEncryptedMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyNotEncrypted(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsNotEncryptedMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsNotEncryptedMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyPrivate(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsPrivateMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsPrivateMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyManyToMany(Type, propertyName) {
        if (!Type) {
            return false;
        }
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsManyToManyMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsManyToManyMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyOneToMany(Type, propertyName) {
        if (!Type) {
            return false;
        }
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsOneToManyMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsOneToManyMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyExternalServiceEntity(Type, propertyName) {
        if (!Type) {
            return false;
        }
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsExternalServiceEntityMap[`${proto.constructor.name}${propertyName}`] !==
                undefined) {
                return this.typePropertyNameToIsExternalServiceEntityMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyTransient(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsTransientMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsTransientMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyExternalId(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsExternalIdMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsExternalIdMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    isTypePropertyInternal(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToIsInternalMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToIsInternalMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    getTypePropertyRemoteServiceFetchSpec(Type, propertyName) {
        let proto = Object.getPrototypeOf(new Type());
        while (proto !== Object.prototype) {
            if (this.typePropertyNameToRemoteServiceFetchSpecMap[`${proto.constructor.name}${propertyName}`] !== undefined) {
                return this.typePropertyNameToRemoteServiceFetchSpecMap[`${proto.constructor.name}${propertyName}`];
            }
            proto = Object.getPrototypeOf(proto);
        }
        return undefined;
    }
}
exports.default = new TypePropertyAnnotationContainer();
//# sourceMappingURL=typePropertyAnnotationContainer.js.map