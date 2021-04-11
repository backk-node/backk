import { Projection } from '../../../../../types/postqueryoperations/Projection';
import AbstractSqlDbManager from '../../../../AbstractSqlDbManager';
export default function tryGetProjection(dbManager: AbstractSqlDbManager, projection: Projection, EntityClass: Function, Types: object, isInternalCall?: boolean): string;
