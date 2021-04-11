import AbstractDbManager from '../../../AbstractDbManager';
export default function tryAlterOrCreateTable(dbManager: AbstractDbManager, entityName: string, EntityClass: Function, schema: string | undefined): Promise<void>;
