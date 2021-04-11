import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
export default function tryRollbackLocalTransactionIfNeeded(isInTransaction: boolean, dbManager: AbstractSqlDbManager): Promise<void>;
