export default function getRootOperations<T extends {
    subEntityPath?: string;
}>(operations: T[], EntityClass: new () => any, Types: any, subEntityPath?: string): T[];
