import _ from 'lodash';
import BaseService from '../service/BaseService';
import generateServicesMetadata from '../metadata/generateServicesMetadata';
import parseServiceFunctionNameToArgAndReturnTypeNameMaps from '../typescript/parser/parseServiceFunctionNameToArgAndReturnTypeNameMaps';
import getSrcFilePathNameForTypeName from '../utils/file/getSrcFilePathNameForTypeName';
import setClassPropertyValidationDecorators from '../validation/setClassPropertyValidationDecorators';
import setNestedTypeValidationDecorators from '../validation/setNestedTypeValidationDecorators';
import writeTestsPostmanCollectionExportFile from '../postman/writeTestsPostmanCollectionExportFile';
import writeApiPostmanCollectionExportFile from '../postman/writeApiPostmanCollectionExportFile';
import generateTypesForServices from '../metadata/generateTypesForServices';
import getNestedClasses from '../metadata/getNestedClasses';
import AbstractDataStore from '../datastore/AbstractDataStore';
import log, { Severity } from '../observability/logging/log';
import { BACKK_ERRORS } from '../errors/backkErrors';
import writeOpenApiSpecFile from '../openapi/writeOpenApiSpecFile';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import { ServiceMetadata } from "../metadata/types/ServiceMetadata";

function addNestedTypes(privateTypeNames: Set<string>, typeName: string, types: { [p: string]: object }) {
  Object.keys(types[typeName]).forEach((typeName) => {
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
  Object.keys(types[typeName]).forEach((typeName) => {
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
  const publicTypeNames = new Set<string>();

  const internalFunctions = functions.filter((func) => {
    if (
      serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
        ServiceClass,
        func.functionName
      )
    ) {
      publicTypeNames.delete(func.argType);
      const { baseTypeName } = getTypeInfoForTypeName(func.returnValueType);
      publicTypeNames.delete(baseTypeName);
      removeNestedTypes(publicTypeNames, baseTypeName, types);
      return false;
    } else {
      publicTypeNames.add(func.argType);
      const { baseTypeName } = getTypeInfoForTypeName(func.returnValueType);
      publicTypeNames.add(baseTypeName);
      addNestedTypes(publicTypeNames, baseTypeName, types);
      return true;
    }
  });

  const internalTypes = types;
  const internalPropertyAccess = propertyAccess;
  const internalTypesDocumentation = typesDocumentation;
  const internalTypeReferences = typeReferences;
  const internalValidations = validations;

  publicTypeNames.forEach((publicTypeName) => {
    delete internalTypes[publicTypeName];
    delete internalPropertyAccess[publicTypeName];
    delete (internalTypesDocumentation as any)?.[publicTypeName];
    delete internalTypeReferences[publicTypeName];
    delete internalValidations[publicTypeName];
  });

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
    const serviceFunctionName = `${ServiceClass.name.charAt(0).toLowerCase() + ServiceClass.name.slice(1)}.${
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
      const { baseTypeName } = getTypeInfoForTypeName(func.returnValueType);
      privateTypeNames.add(baseTypeName);
      addNestedTypes(privateTypeNames, baseTypeName, types);
      return false;
    } else {
      privateTypeNames.delete(func.argType);
      const { baseTypeName } = getTypeInfoForTypeName(func.returnValueType);
      privateTypeNames.delete(baseTypeName);
      removeNestedTypes(privateTypeNames, baseTypeName, types);
      return true;
    }
  });

  const publicTypes = types;
  const publicPropertyAccess = propertyAccess;
  const publicTypesDocumentation = typesDocumentation;
  const publicTypeReferences = typeReferences;
  const publicValidations = validations;

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
  microservice.publicServicesMetadata = microservice.servicesMetadata.map((serviceMetadata: ServiceMetadata) => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      types, // NOSONAR
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
      publicTypes,
      publicPropertyAccess,
      publicTypesDocumentation,
      publicTypeReferences,
      publicValidations
    } = getPublicMetadata(
      microservice[serviceMetadata.serviceName].constructor,
      functions,
      types,
      propertyAccess,
      typesDocumentation,
      typeReferences,
      validations
    );

    return {
      serviceName,
      serviceDocumentation,
      functions: publicFunctions,
      types: publicTypes,
      propertyAccess: publicPropertyAccess,
      typesDocumentation: publicTypesDocumentation,
      typeReferences: publicTypeReferences,
      validations: publicValidations
    };
  });

  return microservice.publicServicesMetadata;
}

export function generateInternalServicesMetadata(microservice: any) {
  microservice.internalServicesMetadata = microservice.servicesMetadata.map((serviceMetadata: ServiceMetadata) => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      types, // NOSONAR
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
      types,
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
  });

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

    if (command === '--generatePublicApiSpecOnly') {
      writeOpenApiSpecFile(microservice, microservice.publicServicesMetadata);
      writeApiPostmanCollectionExportFile(microservice, microservice.publicServicesMetadata);
    }

    if (command === '--generateClusterInternalApiSpecOnly') {
      writeOpenApiSpecFile(microservice, microservice.publicServicesMetadata);
      writeApiPostmanCollectionExportFile(microservice, microservice.publicServicesMetadata);
    }

    microservice.publicServicesMetadata = {
      servicesMetadata: microservice.publicServicesMetadata,
      genericErrors: BACKK_ERRORS
    };

    const serviceNames = Object.entries(microservice)
      .filter(([, service]: [string, any]) => service instanceof BaseService)
      .map(([serviceName]) => serviceName)
      .join(', ');

    log(Severity.INFO, 'Services initialized', serviceNames);
  }
}
