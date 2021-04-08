export default function replaceFieldPathNames(
  fields: string[] | undefined,
  wantedSubEntityPath: string
): string[] {
  return (
    fields
      ?.filter((field) => {
        return field.startsWith(wantedSubEntityPath);
      })
      .map((field) => {
        let [, fieldPathPostFix] = field.split(wantedSubEntityPath);
        if (fieldPathPostFix[0] === '.') {
          fieldPathPostFix = fieldPathPostFix.slice(1);
        }
        return fieldPathPostFix;
      }) ?? []
  );
}
