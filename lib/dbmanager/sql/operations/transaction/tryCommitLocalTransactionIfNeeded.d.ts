import AbstractSqlDbManager from "../../../AbstractSqlDbManager";
export default function tryCommitLocalTransactionIfNeeded(isInTransaction: boolean, dbManager: AbstractSqlDbManager): Promise<void>;
