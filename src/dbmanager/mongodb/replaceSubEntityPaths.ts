export default function replaceSubEntityPaths<T extends { subEntityPath?: string }>(
  operations: T[] | undefined,
  wantedSubEntityPath: string
): T[] {
  return (
    operations
      ?.filter((operation) => {
        return operation.subEntityPath === wantedSubEntityPath || operation.subEntityPath === '*';
      })
      .map((operation) => {
        let newSubEntityPath = operation.subEntityPath;

        if (operation.subEntityPath !== '*') {
          [, newSubEntityPath] = (operation.subEntityPath ?? '').split(wantedSubEntityPath);

          if (newSubEntityPath?.[0] === '.') {
            newSubEntityPath = newSubEntityPath.slice(1);
          }
        }

        return {
          ...operation,
          subEntityPath: newSubEntityPath
        };
      }) ?? []
  );
}
