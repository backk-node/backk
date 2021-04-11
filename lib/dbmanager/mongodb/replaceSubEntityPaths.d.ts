export default function replaceSubEntityPaths<T extends {
    subEntityPath?: string;
}>(operations: T[] | undefined, wantedSubEntityPath: string): T[];
