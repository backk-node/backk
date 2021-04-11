export declare type SortOrder = 'ASC' | 'DESC';
export default function Index(sortOrder?: SortOrder, usingOption?: string, additionalSqlCreateIndexStatementOptions?: string): (object: Object, propertyName: string) => void;
