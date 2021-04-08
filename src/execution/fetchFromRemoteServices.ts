import _ from "lodash";
import getClassPropertyNameToPropertyTypeNameMap from "../metadata/getClassPropertyNameToPropertyTypeNameMap";
import forEachAsyncParallel from "../utils/forEachAsyncParallel";
import typePropertyAnnotationContainer from "../decorators/typeproperty/typePropertyAnnotationContainer";
import callRemoteService from "../remote/http/callRemoteService";
import getTypeInfoForTypeName from "../utils/type/getTypeInfoForTypeName";
import { BackkError } from "../types/BackkError";

export default async function fetchFromRemoteServices(
  Type: new () => any,
  serviceFunctionArgument: any,
  response: any,
  types: any,
  responsePath = ''
): Promise<BackkError | null> {
  const typePropertyNameToPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(Type);

  try {
    await forEachAsyncParallel(
      Object.entries(typePropertyNameToPropertyTypeNameMap),
      async ([propertyName, propertyTypeName]) => {
        const remoteServiceFetchSpec = typePropertyAnnotationContainer.getTypePropertyRemoteServiceFetchSpec(
          Type,
          propertyName
        );

        if (remoteServiceFetchSpec) {
          const remoteServiceFunctionArgument = remoteServiceFetchSpec.buildRemoteServiceFunctionArgument(
            serviceFunctionArgument,
            response
          );

          const [remoteResponse, error] = await callRemoteService(
            remoteServiceFetchSpec.remoteServiceFunctionUrl,
            remoteServiceFunctionArgument,
            remoteServiceFetchSpec.options
          );

          if (error) {
            error.message = `${remoteServiceFetchSpec.remoteServiceFunctionUrl} failed: ${error.message}`;
            throw error;
          }

          _.set(response, responsePath + propertyName, remoteResponse);
        }

        const { baseTypeName } = getTypeInfoForTypeName(propertyTypeName);
        if (types[baseTypeName]) {
          await fetchFromRemoteServices(
            types[baseTypeName],
            serviceFunctionArgument,
            response,
            types,
            (responsePath ? responsePath + '.' : '') + propertyName
          );
        }
      }
    );
  } catch (error) {
    if (responsePath !== '') {
      throw error;
    }

    return error;
  }

  return null;
}
