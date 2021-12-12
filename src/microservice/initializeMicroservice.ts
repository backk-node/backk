import _ from 'lodash';
import AuthorizationService from '../authorization/AuthorizationService';
import ResponseCacheConfigService from '../cache/ResponseCacheConfigService';
import CaptchaVerificationService from '../captcha/CaptchaVerificationService';
import generateClients from '../client/generateClients';
import isClientGenerationNeeded from '../client/isClientGenerationNeeded';
import { DataStore } from '../datastore/DataStore';
import NullDataStore from '../datastore/NullDataStore';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import generateServicesMetadata from '../metadata/generateServicesMetadata';
import generateTypesForServices from '../metadata/generateTypesForServices';
import getNestedClasses from '../metadata/getNestedClasses';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import AuditLoggingService from '../observability/logging/audit/AuditLoggingService';
import log, { Severity } from '../observability/logging/log';
import writeOpenApiSpecFile from '../openapi/writeOpenApiSpecFile';
import writeTestsPostmanCollectionExportFile from '../postman/writeTestsPostmanCollectionExportFile';
import { RequestProcessor } from '../requestprocessor/RequestProcessor';
import BaseService from '../services/BaseService';
import LivenessCheckService from '../services/LivenessCheckService';
import ReadinessCheckService from '../services/ReadinessCheckService';
import StartupCheckService from '../services/startup/StartupCheckService';
import parseServiceFunctionNameToArgAndReturnTypeNameMaps from '../typescript/parser/parseServiceFunctionNameToArgAndReturnTypeNameMaps';
import getSrcFilePathNameForTypeName from '../utils/file/getSrcFilePathNameForTypeName';
import decapitalizeFirstLetter from '../utils/string/decapitalizeFirstLetter';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import setClassPropertyValidationDecorators from '../validation/setClassPropertyValidationDecorators';
import setNestedTypeValidationDecorators from '../validation/setNestedTypeValidationDecorators';

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
        typeName: value,
      };
    }
    return internalTypes;
  }, {});

  const internalPropertyAccess = Object.entries({ ...propertyAccess }).reduce(
    (internalPropertyAccess, [typeName, value]) => {
      if (internalTypeNames.has(typeName)) {
        return {
          ...internalPropertyAccess,
          typeName: value,
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
          typeName: value,
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
          typeName: value,
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
          typeName: value,
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
    internalValidations,
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
    publicValidations,
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
        typesDocumentation,
      } = serviceMetadata;

      const {
        publicFunctions,
        publicTypes: newPublicTypes,
        publicPropertyAccess,
        publicTypesDocumentation,
        publicTypeReferences,
        publicValidations,
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
        validations: publicValidations,
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
        typesDocumentation,
      } = serviceMetadata;

      const {
        internalFunctions,
        internalTypes,
        internalPropertyAccess,
        internalTypesDocumentation,
        internalTypeReferences,
        internalValidations,
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
        validations: internalValidations,
      };
    }
  );

  return microservice.internalServicesMetadata;
}

export default async function initializeMicroservice(
  microservice: any,
  dataStore: DataStore,
  shouldGeneratePostmanIntegrationTestsOnRestartInDevEnv: boolean,
  command: string,
  requestProcessors: RequestProcessor[],
  remoteServiceRootDir = ''
) {
  Object.entries(microservice).forEach(([serviceName, service]: [string, any]) => {
    if (
      serviceName.endsWith('Service') &&
      !(service instanceof BaseService) &&
      !(service instanceof AuditLoggingService) &&
      !(service instanceof CaptchaVerificationService) &&
      !(service instanceof LivenessCheckService) &&
      !(service instanceof ReadinessCheckService) &&
      !(service instanceof StartupCheckService) &&
      !(service instanceof ResponseCacheConfigService) &&
      !(service instanceof AuthorizationService)
    ) {
      throw new Error(
        "Class '" + service.constructor.name + "' must extend from 'BaseService' or 'CrudResourceService'"
      );
    }
  });

  const serviceNameToServiceEntries = Object.entries(microservice).filter(
    ([, service]: [string, any]) => service instanceof BaseService || remoteServiceRootDir
  );

  if (!remoteServiceRootDir) {
    const servicesUniqueByDataStore = _.uniqBy(
      serviceNameToServiceEntries.filter(
        ([, service]: [string, any]) => !(service.getDataStore() instanceof NullDataStore)
      ),
      ([, service]: [string, any]) => service.getDataStore()
    );

    if (servicesUniqueByDataStore.length > 1) {
      throw new Error(
        'Multiple data stores are not allowed. Services can only use one data store which is the same for all services'
      );
    }
  }

  serviceNameToServiceEntries.forEach(([serviceName, service]: [string, any]) => {
    if (serviceName === 'metadataService') {
      throw new Error('metadataService is a reserved internal service name.');
    }

    const serviceFilePathName = getSrcFilePathNameForTypeName(service.constructor.name, remoteServiceRootDir);

    if (!(serviceFilePathName.endsWith('Service.ts') || serviceFilePathName.endsWith('ServiceImpl.ts'))) {
      throw new Error(
        "Invalid file name '" +
          serviceFilePathName +
          "'. Service file name must end with 'Service' or 'ServiceImpl'"
      );
    }

    let expectedServiceName = decapitalizeFirstLetter(service.constructor.name);
    if (service.constructor.name.endsWith('Impl')) {
      expectedServiceName = expectedServiceName.slice(0, -4);
    }

    if (!expectedServiceName.includes(serviceName)) {
      throw new Error(
        "Microservice implementation class property '" +
          serviceName +
          "' should be: '" +
          expectedServiceName +
          "'"
      );
    }

    const serviceDirName = serviceName.toLowerCase();
    if (
      !serviceFilePathName.includes('/src/services/' + serviceDirName) &&
      !serviceFilePathName.includes('/src/services/' + serviceDirName.slice(0, -'service'.length)) &&
      !serviceFilePathName.includes('/node_modules/backk/lib/src')
    ) {
      throw new Error(
        "Service '" +
          service.constructor.name +
          "' should be in directory 'src/services/" +
          serviceDirName +
          "' or 'src/services/'" +
          serviceDirName.slice(0, -'service'.length) +
          "'"
      );
    }

    const [
      serviceDocumentation,
      functionNameToParamTypeNameMap,
      functionNameToReturnTypeNameMap,
      functionNameToDocumentationMap,
    ] = parseServiceFunctionNameToArgAndReturnTypeNameMaps(
      service.constructor,
      serviceFilePathName,
      remoteServiceRootDir
    );

    microservice[`${serviceName}__BackkTypes__`] = {
      serviceDocumentation,
      functionNameToParamTypeNameMap,
      functionNameToReturnTypeNameMap,
      functionNameToDocumentationMap,
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

    if (command === '--generateClientsOnly' || command === '--generateClientsOnlyIfNeeded') {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Client generation allowed in dev environment only');
      }

      const publicTypeNames =
        microservice.publicServicesMetadata ?? generatePublicServicesMetadata(microservice);
      const internalTypeNames =
        microservice.internalServicesMetadata ?? generateInternalServicesMetadata(microservice);

      if (command === '--generateClientsOnly') {
        await generateClients(microservice, publicTypeNames, internalTypeNames, requestProcessors);
        console.log('Successfully generated clients.');
      }

      if (command === '--generateClientsOnlyIfNeeded') {
        if (isClientGenerationNeeded(microservice, publicTypeNames, internalTypeNames)) {
          await generateClients(microservice, publicTypeNames, internalTypeNames, requestProcessors);
          console.log('Successfully generated clients.');
        } else {
          console.log('Generation of clients is not needed. Clients are up to date.');
        }
      }
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

      console.log('Successfully generated API specs.');
    }

    const serviceNames = Object.entries(microservice)
      .filter(([, service]: [string, any]) => service instanceof BaseService)
      .map(([serviceName]) => serviceName)
      .join(', ');

    if (!command) {
      log(Severity.INFO, 'Services initialized', serviceNames);
    }
  }
}
