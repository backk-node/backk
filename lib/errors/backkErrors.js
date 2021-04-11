"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKK_ERRORS = void 0;
const constants_1 = require("../constants/constants");
exports.BACKK_ERRORS = {
    ENTITY_VERSION_MISMATCH: {
        errorCode: '1',
        message: 'Entity version conflict. Entity was updated before this request, please re-fetch the entity and try update again',
        statusCode: constants_1.HttpStatusCodes.CONFLICT
    },
    ENTITY_LAST_MODIFIED_TIMESTAMP_MISMATCH: {
        errorCode: '2',
        message: 'Entity last modified timestamp conflict. Entity was updated before this request, please re-fetch the entity and try update again',
        statusCode: constants_1.HttpStatusCodes.CONFLICT
    },
    DUPLICATE_ENTITY: {
        errorCode: '3',
        message: 'Duplicate entity',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    ENTITY_NOT_FOUND: {
        errorCode: '4',
        message: 'Entity not found',
        statusCode: constants_1.HttpStatusCodes.NOT_FOUND
    },
    INVALID_ARGUMENT: {
        errorCode: '5',
        message: 'Invalid argument: ',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    SERVICE_FUNCTION_CALL_NOT_AUTHORIZED: {
        errorCode: '6',
        message: 'Service function call not authorized',
        statusCode: constants_1.HttpStatusCodes.FORBIDDEN
    },
    MAX_ENTITY_COUNT_REACHED: {
        errorCode: '7',
        message: 'Maximum sub-entity count reached. Cannot add new sub-entity',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    UNKNOWN_SERVICE: {
        errorCode: '8',
        message: 'Unknown service: ',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    UNKNOWN_SERVICE_FUNCTION: {
        errorCode: '9',
        message: 'Unknown function: ',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    MISSING_SERVICE_FUNCTION_ARGUMENT: {
        errorCode: '10',
        message: 'Missing service function argument',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED: {
        errorCode: '11',
        message: 'Remote service function call not allowed',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    TOO_MANY_SERVICE_FUNCTIONS_CALLED: {
        errorCode: '12',
        errorMessage: 'Too many service functions called',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    REMOTE_SERVICE_FUNCTION_CALL_NOT_ALLOWED_INSIDE_TRANSACTION: {
        errorCode: '13',
        message: 'Remote service function call not allowed inside transaction',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    ALLOWED_REMOTE_SERVICE_FUNCTIONS_REGEXP_PATTERN_NOT_DEFINED: {
        errorCode: '14',
        message: 'Allowed remote service functions regular expression pattern not defined',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    },
    HTTP_METHOD_MUST_BE_POST: {
        errorCode: '15',
        message: 'Invalid HTTP method. HTTP method must be POST',
        statusCode: constants_1.HttpStatusCodes.BAD_REQUEST
    }
};
//# sourceMappingURL=backkErrors.js.map