import { FilterQuery } from "mongodb";
export default class MongoDbQuery<T> {
    subEntityPath: string;
    filterQuery: FilterQuery<T>;
    constructor(filterQuery: FilterQuery<T>, subEntityPath?: string);
}
