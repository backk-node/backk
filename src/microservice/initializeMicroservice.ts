import _ from 'lodash';
import BaseService from '../services/BaseService';
import generateServicesMetadata from '../metadata/generateServicesMetadata';
import parseServiceFunctionNameToArgAndReturnTypeNameMaps from '../typescript/parser/parseServiceFunctionNameToArgAndReturnTypeNameMaps';
import getSrcFilePathNameForTypeName from '../utils/file/getSrcFilePathNameForTypeName';
import setClassPropertyValidationDecorators from '../validation/setClassPropertyValidationDecorators';
import setNestedTypeValidationDecorators from '../validation/setNestedTypeValidationDecorators';
import writeTestsPostmanCollectionExportFile from '../postman/writeTestsPostmanCollectionExportFile';
import generateTypesForServices from '../metadata/generateTypesForServices';
import getNestedClasses from '../metadata/getNestedClasses';
import AbstractDataStore from '../datastore/AbstractDataStore';
import log, { Severity } from '../observability/logging/log';
import writeOpenApiSpecFile from '../openapi/writeOpenApiSpecFile';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import generateClients from "../client/generateClients";

function addNestedTypes(privateTypeNames: Set<string>, typeName: string, types: { [p: string]: object }) {
  Object.values(types[typeName] ?? {}).forEach((typeName) => {
    const { baseTypeName } = getTypeInfoForTypeName(typeName);
    if (
      baseTypeName[0].toUpperCase() === baseTypeName[0] &&
      baseTypeName !== '(' &&
      baseTypeName !== 'Date'
    ) {
      privateTypeNames.add(typeName);
      addNestedTypes(privateTypeNames, baseTypeName, types);
    }
  });
}

function removeNestedTypes(privateTypeNames: Set<string>, typeName: string, types: { [p: string]: object }) {
  Object.values(types[typeName] ?? {}).forEach((typeName) => {
    const { baseTypeName } = getTypeInfoForTypeName(typeName);
    if (
      baseTypeName[0].toUpperCase() === baseTypeName[0] &&
      baseTypeName !== '(' &&
      baseTypeName !== 'Date'
    ) {
      privateTypeNames.delete(typeName);
      removeNestedTypes(privateTypeNames, baseTypeName, types);
    }
  });
}

function getInternalMetadata(
  ServiceClass: any,
  functions: FunctionMetadata[],
  types: { [p: string]: object },
  propertyAccess: { [p: string]: object },
  typesDocumentation: object | undefined,
  typeReferences: { [p: string]: string },
  validations: { [p: string]: any[] }
) {
  const internalTypeNames = new Set<string>();

  const internalFunctions = functions.filter((func) => {
    const SuperClass = Object.getPrototypeOf(ServiceClass.prototype).constructor;

    const serviceFunctionName = `${SuperClass.name.charAt(0).toLowerCase() + SuperClass.name.slice(1)}.${
      func.functionName
    }`;

    if (
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
        ServiceClass,
        func.functionName
      ) &&
      !serviceFunctionAnnotationContainer.getServiceFunctionNameToCronScheduleMap()[serviceFunctionName]
    ) {
      internalTypeNames.add(func.argType);
      addNestedTypes(internalTypeNames, func.argType, types);
      const { baseTypeName } = getTypeInfoForTypeName(func.returnValueType);
      internalTypeNames.add(baseTypeName);
      addNestedTypes(internalTypeNames, baseTypeName, types);
      return true;
    } else {
      return false;
    }
  });

  const internalTypes = Object.entries({ ...types }).reduce((internalTypes, [typeName, value]) => {
    if (internalTypeNames.has(typeName)) {
      return {
        ...internalTypes,
        typeName: value
      };
    }
    return internalTypes;
  }, {});

  const internalPropertyAccess = Object.entries({ ...propertyAccess }).reduce(
    (internalPropertyAccess, [typeName, value]) => {
      if (internalTypeNames.has(typeName)) {
        return {
          ...internalPropertyAccess,
          typeName: value
        };
      }
      return internalPropertyAccess;
    },
    {}
  );

  const internalTypesDocumentation = Object.entries({ ...typesDocumentation }).reduce(
    (internalTypesDocumentation, [typeName, value]) => {
      if (internalTypeNames.has(typeName)) {
        return {
          ...internalTypesDocumentation,
          typeName: value
        };
      }
      return internalTypesDocumentation;
    },
    {}
  );

  const internalTypeReferences = Object.entries({ ...typeReferences }).reduce(
    (internalTypeReferences, [typeName, value]) => {
      if (internalTypeNames.has(typeName)) {
        return {
          ...internalTypeReferences,
          typeName: value
        };
      }
      return internalTypeReferences;
    },
    {}
  );

  const internalValidations = Object.entries({ ...validations }).reduce(
    (internalTypes, [typeName, value]) => {
      if (internalTypeNames.has(typeName)) {
        return {
          ...internalTypes,
          typeName: value
        };
      }
      return internalTypes;
    },
    {}
  );

  return {
    internalFunctions,
    internalTypes,
    internalPropertyAccess,
    internalTypesDocumentation,
    internalTypeReferences,
    internalValidations
  };
}

function getPublicMetadata(
  ServiceClass: any,
  functions: FunctionMetadata[],
  types: { [p: string]: object },
  propertyAccess: { [p: string]: object },
  typesDocumentation: object | undefined,
  typeReferences: { [p: string]: string },
  validations: { [p: string]: any[] }
) {
  const privateTypeNames = new Set<string>();
  const publicFunctions = functions.filter((func) => {
    const SuperClass = Object.getPrototypeOf(ServiceClass.prototype).constructor;

    const serviceFunctionName = `${SuperClass.name.charAt(0).toLowerCase() + SuperClass.name.slice(1)}.${
      func.functionName
    }`;

    if (
      serviceFunctionAnnotationContainer.getServiceFunctionNameToCronScheduleMap()[serviceFunctionName] ||
      serviceFunctionAnnotationContainer.hasOnStartUp(ServiceClass, func.functionName) ||
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
        ServiceClass,
        func.functionName
      )
    ) {
      privateTypeNames.add(func.argType);
      addNestedTypes(privateTypeNames, func.argType, types);
      const { baseTypeName } = getTypeInfoForTypeName(func.returnValueType);
      privateTypeNames.add(baseTypeName);
      addNestedTypes(privateTypeNames, baseTypeName, types);
      return false;
    } else {
      privateTypeNames.delete(func.argType);
      removeNestedTypes(privateTypeNames, func.argType, types);
      const { baseTypeName } = getTypeInfoForTypeName(func.returnValueType);
      privateTypeNames.delete(baseTypeName);
      removeNestedTypes(privateTypeNames, baseTypeName, types);
      return true;
    }
  });

  const publicTypes = { ...types };
  const publicPropertyAccess = { ...propertyAccess };
  const publicTypesDocumentation = { ...typesDocumentation };
  const publicTypeReferences = { ...typeReferences };
  const publicValidations = { ...validations };

  privateTypeNames.forEach((privateTypeName) => {
    delete publicTypes[privateTypeName];
    delete publicPropertyAccess[privateTypeName];
    delete (publicTypesDocumentation as any)?.[privateTypeName];
    delete publicTypeReferences[privateTypeName];
    delete publicValidations[privateTypeName];
  });

  return {
    publicFunctions,
    publicTypes,
    publicPropertyAccess,
    publicTypesDocumentation,
    publicTypeReferences,
    publicValidations
  };
}

export function generatePublicServicesMetadata(microservice: any) {
  microservice.publicServicesMetadata = microservice.servicesMetadata.map(
    (serviceMetadata: ServiceMetadata) => {
      const {
        publicTypes,
        serviceName,
        functions,
        validations,
        propertyAccess,
        serviceDocumentation,
        typeReferences,
        typesDocumentation
      } = serviceMetadata;

      const {
        publicFunctions,
        publicTypes: newPublicTypes,
        publicPropertyAccess,
        publicTypesDocumentation,
        publicTypeReferences,
        publicValidations
      } = getPublicMetadata(
        microservice[serviceMetadata.serviceName].constructor,
        functions,
        publicTypes,
        propertyAccess,
        typesDocumentation,
        typeReferences,
        validations
      );

      return {
        serviceName,
        serviceDocumentation,
        functions: publicFunctions,
        types: newPublicTypes,
        propertyAccess: publicPropertyAccess,
        typesDocumentation: publicTypesDocumentation,
        typeReferences: publicTypeReferences,
        validations: publicValidations
      };
    }
  );

  return microservice.publicServicesMetadata;
}

export function generateInternalServicesMetadata(microservice: any) {
  microservice.internalServicesMetadata = microservice.servicesMetadata.map(
    (serviceMetadata: ServiceMetadata) => {
      const {
        publicTypes,
        serviceName,
        functions,
        validations,
        propertyAccess,
        serviceDocumentation,
        typeReferences,
        typesDocumentation
      } = serviceMetadata;

      const {
        internalFunctions,
        internalTypes,
        internalPropertyAccess,
        internalTypesDocumentation,
        internalTypeReferences,
        internalValidations
      } = getInternalMetadata(
        microservice[serviceMetadata.serviceName].constructor,
        functions,
        publicTypes,
        propertyAccess,
        typesDocumentation,
        typeReferences,
        validations
      );

      return {
        serviceName,
        serviceDocumentation,
        functions: internalFunctions,
        types: internalTypes,
        propertyAccess: internalPropertyAccess,
        typesDocumentation: internalTypesDocumentation,
        typeReferences: internalTypeReferences,
        validations: internalValidations
      };
    }
  );

  return microservice.internalServicesMetadata;
}

export default function initializeMicroservice(
  microservice: any,
  dataStore: AbstractDataStore,
  shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv: boolean,
  command: string,
  remoteServiceRootDir = ''
) {
  const serviceNameToServiceEntries = Object.entries(microservice).filter(
    ([, service]: [string, any]) => service instanceof BaseService || remoteServiceRootDir
  );

  if (serviceNameToServiceEntries.length === 0) {
    throw new Error(
      microservice.constructor + ': No services defined. Services must extend from BaseService.'
    );
  }

  if (!remoteServiceRootDir) {
    const servicesUniqueByDataStore = _.uniqBy(serviceNameToServiceEntries, ([, service]: [string, any]) =>
      service.getDataStore()
    );

    if (servicesUniqueByDataStore.length > 1) {
      throw new Error('Services can use only one same database manager');
    }
  }

  serviceNameToServiceEntries.forEach(([serviceName]: [string, any]) => {
    if (serviceName === 'metadataService') {
      throw new Error('metadataService is a reserved internal service name.');
    }

    const [
      serviceDocumentation,
      functionNameToParamTypeNameMap,
      functionNameToReturnTypeNameMap,
      functionNameToDocumentationMap
    ] = parseServiceFunctionNameToArgAndReturnTypeNameMaps(
      microservice[serviceName].constructor,
      serviceName,
      getSrcFilePathNameForTypeName(
        serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
        remoteServiceRootDir
      ),
      remoteServiceRootDir
    );

    microservice[`${serviceName}__BackkTypes__`] = {
      serviceDocumentation,
      functionNameToParamTypeNameMap,
      functionNameToReturnTypeNameMap,
      functionNameToDocumentationMap
    };
  });

  generateTypesForServices(microservice, remoteServiceRootDir);

  Object.entries(microservice)
    .filter(
      ([serviceName, service]: [string, any]) =>
        service instanceof BaseService || (remoteServiceRootDir && !serviceName.endsWith('__BackkTypes__'))
    )
    .forEach(([serviceName]: [string, any]) => {
      getNestedClasses(
        Object.keys(microservice[serviceName].Types ?? {}),
        microservice[serviceName].Types,
        microservice[serviceName].TopLevelTypes,
        remoteServiceRootDir
      );

      Object.entries(microservice[serviceName].Types ?? {}).forEach(([, typeClass]: [string, any]) => {
        setClassPropertyValidationDecorators(
          typeClass,
          serviceName,
          microservice[serviceName].Types,
          remoteServiceRootDir
        );

        setNestedTypeValidationDecorators(typeClass);
      }, {});
    });

  const servicesMetadata = generateServicesMetadata(microservice, dataStore, remoteServiceRootDir);

  if (!remoteServiceRootDir) {
    microservice.servicesMetadata = servicesMetadata;

    if (process.env.NODE_ENV === 'development' && shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv) {
      writeTestsPostmanCollectionExportFile(microservice, servicesMetadata);
    }

    if (command === '--generateClientsOnly') {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Client generation allowed in dev environment only');
      }
      const publicTypeNames = Object.keys((microservice.publicServicesMetadata ?? generatePublicServicesMetadata(microservice)).types);
      const internalTypeNames = Object.keys((microservice.internalServicesMetadata ?? generateInternalServicesMetadata(microservice)).types);
      generateClients(publicTypeNames, internalTypeNames);
    }

    if (command === '--generateApiSpecsOnly') {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('API spec generation allowed in dev environment only');
      }
      writeOpenApiSpecFile(
        microservice,
        microservice.publicServicesMetadata ?? generatePublicServicesMetadata(microservice),
        'public'
      );
    }

    if (command === '--generateApiSpecsOnly') {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('API spec generation allowed in dev environment only');
      }
      writeOpenApiSpecFile(
        microservice,
        microservice.internalServicesMetadata ?? generateInternalServicesMetadata(microservice),
        'internal'
      );
    }

    const serviceNames = Object.entries(microservice)
      .filter(([, service]: [string, any]) => service instanceof BaseService)
      .map(([serviceName]) => serviceName)
      .join(', ');

    log(Severity.INFO, 'Services initialized', serviceNames);
  }
}
