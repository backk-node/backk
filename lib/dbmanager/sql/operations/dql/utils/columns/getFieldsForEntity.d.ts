import { Projection } from '../../../../../../types/postqueryoperations/Projection';
import AbstractSqlDbManager from '../../../../../AbstractSqlDbManager';
export default function getFieldsForEntity(dbManager: AbstractSqlDbManager, fields: string[], EntityClass: Function, Types: object, projection: Projection, fieldPath: string, isInternalCall?: boolean, tableAlias?: string): void;
