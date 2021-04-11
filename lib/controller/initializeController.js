"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const BaseService_1 = __importDefault(require("../service/BaseService"));
const generateServicesMetadata_1 = __importDefault(require("../metadata/generateServicesMetadata"));
const parseServiceFunctionNameToArgAndReturnTypeNameMaps_1 = __importDefault(require("../typescript/parser/parseServiceFunctionNameToArgAndReturnTypeNameMaps"));
const getSrcFilePathNameForTypeName_1 = __importDefault(require("../utils/file/getSrcFilePathNameForTypeName"));
const setClassPropertyValidationDecorators_1 = __importDefault(require("../validation/setClassPropertyValidationDecorators"));
const setNestedTypeValidationDecorators_1 = __importDefault(require("../validation/setNestedTypeValidationDecorators"));
const writeTestsPostmanCollectionExportFile_1 = __importDefault(require("../postman/writeTestsPostmanCollectionExportFile"));
const writeApiPostmanCollectionExportFile_1 = __importDefault(require("../postman/writeApiPostmanCollectionExportFile"));
const generateTypesForServices_1 = __importDefault(require("../metadata/generateTypesForServices"));
const getNestedClasses_1 = __importDefault(require("../metadata/getNestedClasses"));
const log_1 = __importStar(require("../observability/logging/log"));
const backkErrors_1 = require("../errors/backkErrors");
function initializeController(controller, dbManager, controllerInitOptions, remoteServiceRootDir = '') {
    var _a, _b;
    const serviceNameToServiceEntries = Object.entries(controller).filter(([, service]) => service instanceof BaseService_1.default || remoteServiceRootDir);
    if (serviceNameToServiceEntries.length === 0) {
        throw new Error(controller.constructor + ': No services defined. Services must extend from BaseService.');
    }
    if (!remoteServiceRootDir) {
        const servicesUniqueByDbManager = lodash_1.default.uniqBy(serviceNameToServiceEntries, ([, service]) => service.getDbManager());
        if (servicesUniqueByDbManager.length > 1) {
            throw new Error('Services can use only one same database manager');
        }
    }
    serviceNameToServiceEntries.forEach(([serviceName]) => {
        if (serviceName === 'metadataService') {
            throw new Error('metadataService is a reserved internal service name.');
        }
        else if (serviceName === 'livenessCheckService') {
            throw new Error('livenessCheckService is a reserved internal service name.');
        }
        const [serviceDocumentation, functionNameToParamTypeNameMap, functionNameToReturnTypeNameMap, functionNameToDocumentationMap] = parseServiceFunctionNameToArgAndReturnTypeNameMaps_1.default(controller[serviceName].constructor, serviceName, getSrcFilePathNameForTypeName_1.default(serviceName.charAt(0).toUpperCase() + serviceName.slice(1), remoteServiceRootDir), remoteServiceRootDir);
        controller[`${serviceName}__BackkTypes__`] = {
            serviceDocumentation,
            functionNameToParamTypeNameMap,
            functionNameToReturnTypeNameMap,
            functionNameToDocumentationMap
        };
    });
    generateTypesForServices_1.default(controller, remoteServiceRootDir);
    Object.entries(controller)
        .filter(([serviceName, service]) => service instanceof BaseService_1.default || (remoteServiceRootDir && !serviceName.endsWith('__BackkTypes__')))
        .forEach(([serviceName]) => {
        var _a, _b;
        getNestedClasses_1.default(Object.keys((_a = controller[serviceName].Types) !== null && _a !== void 0 ? _a : {}), controller[serviceName].Types, controller[serviceName].PublicTypes, remoteServiceRootDir);
        Object.entries((_b = controller[serviceName].Types) !== null && _b !== void 0 ? _b : {}).forEach(([, typeClass]) => {
            setClassPropertyValidationDecorators_1.default(typeClass, serviceName, controller[serviceName].Types, remoteServiceRootDir);
            setNestedTypeValidationDecorators_1.default(typeClass);
        }, {});
    });
    const servicesMetadata = generateServicesMetadata_1.default(controller, dbManager, remoteServiceRootDir);
    if (!remoteServiceRootDir) {
        controller.servicesMetadata = servicesMetadata;
        controller.publicServicesMetadata = servicesMetadata.map((serviceMetadata) => {
            const { types, publicTypes, serviceName, functions, validations, propertyModifiers, serviceDocumentation, typeReferences, typesDocumentation } = serviceMetadata;
            return {
                serviceName,
                serviceDocumentation,
                functions,
                types: publicTypes,
                propertyModifiers,
                typesDocumentation,
                typeReferences,
                validations
            };
        });
        controller.publicServicesMetadata = {
            servicesMetadata: controller.publicServicesMetadata,
            genericErrors: backkErrors_1.BACKK_ERRORS
        };
        if (process.env.NODE_ENV === 'development' && ((_a = controllerInitOptions === null || controllerInitOptions === void 0 ? void 0 : controllerInitOptions.generatePostmanTestFile) !== null && _a !== void 0 ? _a : true)) {
            writeTestsPostmanCollectionExportFile_1.default(controller, servicesMetadata);
        }
        if (process.env.NODE_ENV === 'development' && ((_b = controllerInitOptions === null || controllerInitOptions === void 0 ? void 0 : controllerInitOptions.generatePostmanApiFile) !== null && _b !== void 0 ? _b : true)) {
            writeApiPostmanCollectionExportFile_1.default(controller, servicesMetadata);
        }
        const serviceNames = Object.entries(controller)
            .filter(([, service]) => service instanceof BaseService_1.default)
            .map(([serviceName]) => serviceName)
            .join(', ');
        log_1.default(log_1.Severity.INFO, 'Services initialized', serviceNames);
    }
}
exports.default = initializeController;
//# sourceMappingURL=initializeController.js.map