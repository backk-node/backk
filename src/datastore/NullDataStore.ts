import { Field, Many, One } from "./DataStore";
import { BackkEntity } from "../types/entities/BackkEntity";
import { SubEntity } from "../types/entities/SubEntity";
import MongoDbFilter from "./mongodb/MongoDbFilter";
import SqlFilter from "./sql/filters/SqlFilter";
import { PromiseErrorOr } from "../types/PromiseErrorOr";
import AbstractDataStore from "./AbstractDataStore";

export default class NullDataStore extends AbstractDataStore {
  constructor() {
    super('');
  }

  updateEntityByFilters<T extends BackkEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  deleteEntityByFilters<T extends BackkEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  getModifyColumnStatement(): string {
    throw new Error('Not implemented');
  }

  addSubEntitiesToEntityById<T extends BackkEntity, U extends object>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  addSubEntityToEntityById<T extends BackkEntity, U extends SubEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  createEntity<T>(): PromiseErrorOr<One<T>> {
    throw new Error('Not implemented');
  }

  deleteAllEntities<T>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  deleteEntitiesByFilters<T extends object>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  deleteEntityById<T extends object>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  executeInsideTransaction<T>(): PromiseErrorOr<T> {
    throw new Error('Not implemented');
  }

  getAllEntities<T extends BackkEntity>(): PromiseErrorOr<Many<T>> {
    throw new Error('Not implemented');
  }

  getDbHost(): string {
    return '';
  }

  getDataStoreType(): string {
    return '';
  }

  getEntitiesByFilters<T extends BackkEntity>(): PromiseErrorOr<Many<T>> {
    throw new Error('Not implemented');
  }

  getEntitiesByIds<T>(): PromiseErrorOr<Many<T>> {
    throw new Error('Not implemented');
  }

  getEntityCount<T>(): PromiseErrorOr<number> {
    throw new Error('Not implemented');
  }

  getEntityById<T>(): PromiseErrorOr<One<T>> {
    throw new Error('Not implemented');
  }

  getIdColumnType(): string {
    return '';
  }

  getTimestampType(): string {
    return '';
  }

  getVarCharType(): string {
    return '';
  }

  isDbReady(): Promise<boolean> {
    return Promise.resolve(false);
  }

  removeSubEntitiesFromEntityById<T extends BackkEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  removeSubEntityFromEntityById<T extends BackkEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  tryExecute<T>(): Promise<T> {
    throw new Error('Not implemented');
  }

  tryExecuteSql<T>(): Promise<Field[]> {
    throw new Error('Not implemented');
  }

  tryExecuteSqlWithoutCls<T>(): Promise<Field[]> {
    throw new Error('Not implemented');
  }

  tryReleaseDbConnectionBackToPool(): void {
    // No operation
  }

  tryReserveDbConnectionFromPool(): Promise<void> {
    return Promise.resolve(undefined);
  }

  updateEntity<T extends BackkEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  cleanupTransaction(): void {
    // No operation
  }

  getClient(): any {
    return undefined;
  }

  tryBeginTransaction(): Promise<void> {
    return Promise.resolve(undefined);
  }

  connectMongoDb(): Promise<void> {
    return Promise.resolve(undefined);
  }

  disconnectMongoDb(): Promise<void> {
    return Promise.resolve(undefined);
  }

  getEntityByFilters<T extends BackkEntity>(): PromiseErrorOr<One<T>> {
    throw new Error('Not implemented');
  }

  isDuplicateEntityError(): boolean {
    throw new Error('Not implemented');
  }

  getFilters<T>(): Array<MongoDbFilter<T> | SqlFilter> | Partial<T> | object {
    throw new Error('Not implemented');
  }

  shouldConvertTinyIntegersToBooleans(): boolean {
    return false;
  }

  updateEntitiesByFilters<T extends BackkEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  getBooleanType(): string {
    throw new Error('Not implemented');
  }

  removeSubEntityFromEntityByFilters<T extends BackkEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  addArrayFieldValuesToEntityById<T extends BackkEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  removeArrayFieldValuesFromEntityById<T extends BackkEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  removeSubEntitiesFromEntityByFilters<T extends BackkEntity, U extends object>(): PromiseErrorOr<
    null
  > {
    throw new Error('Not implemented');
  }

  addSubEntitiesToEntityByFilters<T extends BackkEntity, U extends SubEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  addSubEntityToEntityByFilters<T extends BackkEntity, U extends SubEntity>(): PromiseErrorOr<null> {
    throw new Error('Not implemented');
  }

  doesArrayFieldContainValueInEntityById<T extends BackkEntity>(): PromiseErrorOr<boolean> {
    throw new Error('Not implemented');
  }
}
