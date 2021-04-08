import { FilterQuery } from "mongodb";
import shouldUseRandomInitializationVector from "../../crypt/shouldUseRandomInitializationVector";
import shouldEncryptValue from "../../crypt/shouldEncryptValue";
import encrypt from "../../crypt/encrypt";

export default class MongoDbQuery<T> {
  subEntityPath: string;
  filterQuery: FilterQuery<T>;

  constructor(filterQuery: FilterQuery<T>, subEntityPath?: string) {
    this.subEntityPath = subEntityPath ?? '';
    this.filterQuery = {}

    Object.entries(filterQuery).forEach(([fieldName, fieldValue]) => {
      let finalFieldValue = fieldValue;

      if (!shouldUseRandomInitializationVector(fieldName) && shouldEncryptValue(fieldName)) {
        finalFieldValue = encrypt(fieldValue, false);
      }

      (this.filterQuery as any)[fieldName] = finalFieldValue;
    })
  }
}
