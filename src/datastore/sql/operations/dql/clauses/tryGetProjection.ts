import getFieldsFromGraphQlOrJson from '../../../../../graphql/getFieldsFromGraphQlOrJson';
import { Projection } from '../../../../../types/postqueryoperations/Projection';
import getFieldsForEntity from '../utils/columns/getFieldsForEntity';
import createErrorMessageWithStatusCode from '../../../../../errors/createErrorMessageWithStatusCode';
import AbstractSqlDataStore from '../../../../AbstractSqlDataStore';
import { HttpStatusCodes } from '../../../../../constants/constants';
import EntityCountRequest from '../../../../../types/EntityCountRequest';

export default function tryGetProjection(
  dataStore: AbstractSqlDataStore,
  projection: Projection,
  EntityClass: Function,
  Types: object,
  entityCountRequests?: EntityCountRequest[],
  isInternalCall = false
): string {
  const fields: string[] = [];

  if (projection.includeResponseFields?.[0]?.includes('{')) {
    projection.includeResponseFields = getFieldsFromGraphQlOrJson(projection.includeResponseFields[0]);
  }

  if (projection.excludeResponseFields?.[0]?.includes('{')) {
    projection.excludeResponseFields = getFieldsFromGraphQlOrJson(projection.excludeResponseFields[0]);
  }

  if (projection.includeResponseFields) {
    const fields: string[] = [];

    projection.includeResponseFields.forEach((includeResponseField) => {
      getFieldsForEntity(
        dataStore,
        fields,
        EntityClass as any,
        Types,
        { includeResponseFields: [includeResponseField] },
        '',
        entityCountRequests,
        isInternalCall
      );

      if (fields.length === 0) {
        throw new Error(
          createErrorMessageWithStatusCode(
            'Invalid field: ' + includeResponseField + ' in includeResponseFields',
            HttpStatusCodes.BAD_REQUEST
          )
        );
      }
    });
  }

  if (projection.excludeResponseFields) {
    const fields: string[] = [];

    projection.excludeResponseFields.forEach((excludeResponseField) => {
      getFieldsForEntity(
        dataStore,
        fields,
        EntityClass as any,
        Types,
        { includeResponseFields: [excludeResponseField] },
        '',
        entityCountRequests,
        isInternalCall
      );

      if (fields.length === 0) {
        throw new Error(
          createErrorMessageWithStatusCode(
            'Invalid field: ' + excludeResponseField + ' in excludeResponseFields',
            HttpStatusCodes.BAD_REQUEST
          )
        );
      }
    });
  }

  getFieldsForEntity(
    dataStore,
    fields,
    EntityClass as any,
    Types,
    projection,
    '',
    entityCountRequests,
    isInternalCall
  );
  return fields.join(', ');
}
