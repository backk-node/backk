import AbstractDbManager, { Field } from '../../../AbstractDbManager';
export default function tryAlterTable(dbManager: AbstractDbManager, entityName: string, EntityClass: Function, schema: string | undefined, databaseFields: Field[]): Promise<void>;
