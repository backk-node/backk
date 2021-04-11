import { PostQueryOperations } from "../../types/postqueryoperations/PostQueryOperations";
import MongoDbQuery from "./MongoDbQuery";
import MongoDbManager from "../MongoDbManager";
export default function tryFetchAndAssignSubEntitiesForManyToManyRelationships<T>(dbManager: MongoDbManager, rows: T[], EntityClass: new () => T, Types: object, filters?: Array<MongoDbQuery<T>>, postQueryOperations?: PostQueryOperations, isInternalCall?: boolean, propertyJsonPath?: string, subEntityPath?: string): Promise<void>;
