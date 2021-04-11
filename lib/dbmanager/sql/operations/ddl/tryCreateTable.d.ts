import AbstractDbManager from '../../../AbstractDbManager';
export default function tryCreateTable(dbManager: AbstractDbManager, entityName: string, EntityClass: Function, schema: string | undefined, isPhysicalTable: boolean): Promise<void>;
