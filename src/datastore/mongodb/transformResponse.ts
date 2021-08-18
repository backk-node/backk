import pick from 'lodash/pick';
import omit from 'lodash/omit';
import { PostQueryOperations } from "../../types/postqueryoperations/PostQueryOperations";

export default function transformResponse<T extends object>(
  responseObjects: T[],
  args: PostQueryOperations
): Array<Partial<T>> {
  return responseObjects.map((responseObject) => {
    let newResponseObject: Partial<T> = responseObject;
    if (args.includeResponseFields) {
      newResponseObject = pick(responseObject, args.includeResponseFields);
    }
    if (args.excludeResponseFields) {
      newResponseObject = omit(newResponseObject, args.excludeResponseFields);
    }
    return newResponseObject;
  });
}
