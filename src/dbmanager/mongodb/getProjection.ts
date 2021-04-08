import getIncludeFieldsMap from './getIncludeFieldsMap';
import getExcludeFieldsMap from './getExcludeFieldsMap';
import { Projection } from '../../types/postqueryoperations/Projection';
import getFieldsFromGraphQlOrJson from '../../graphql/getFieldsFromGraphQlOrJson';
import getDefaultIncludeFieldsMap from "./getDefaultIncludeFieldsMap";

export default function getProjection(EntityClass: new() => any, projection?: Projection): object {
  let includeResponseFields = projection?.includeResponseFields;
  if (projection?.includeResponseFields?.[0]?.includes('{')) {
    includeResponseFields = getFieldsFromGraphQlOrJson(projection.includeResponseFields[0]);
  }

  let excludeResponseFields = projection?.excludeResponseFields;
  if (projection?.excludeResponseFields?.[0]?.includes('{')) {
    excludeResponseFields = getFieldsFromGraphQlOrJson(projection.excludeResponseFields[0]);
  }

  let includeFieldsMap = getIncludeFieldsMap(includeResponseFields);

  if (!includeResponseFields || includeResponseFields.length === 0) {
    includeFieldsMap = getDefaultIncludeFieldsMap(EntityClass);
  }

  const excludeFieldsMap = getExcludeFieldsMap(excludeResponseFields);

  Object.keys(includeFieldsMap).forEach(includeFieldName => {
    if((excludeFieldsMap as any)[includeFieldName] === 0) {
      delete (includeFieldsMap as any)[includeFieldName];
    }
  })

  return includeFieldsMap;
}
