import _ from 'lodash';

export default function mergeImports(importLines: string[]) {
  const nonMergeableImportLines = importLines.filter(
    (importLine) =>
      !importLine
        .slice(7)
        .trim()
        .startsWith('{')
  );

  const importFileToImportedNamesMap = importLines
    .filter((importLine) =>
      importLine
        .slice(7)
        .trim()
        .startsWith('{')
    )
    .reduce((importFileToImportedNamesMap: { [key: string]: string[] }, importLine) => {

      const [importedNamesPart, importFilePart] = importLine
        .slice(7, -1)
        .trim()
        .split('from');

      const importFileName = importFilePart.split(/['"]/)[1];
      const importedNames = importedNamesPart
        .split(/[{}]/)[1]
        .split(',')
        .map((importedName) => importedName.trim());

      return {
        ...importFileToImportedNamesMap,
        [importFileName]: importFileToImportedNamesMap[importFileName]
          ? _.uniq(_.flatten([...importFileToImportedNamesMap[importFileName], importedNames]))
          : importedNames
      };
    }, {});

  const mergeImportLines = Object.entries(importFileToImportedNamesMap).map(
    ([importFile, importedNames]) => `import { ${importedNames.join(', ')} } from "${importFile}"`
  );

  return [...nonMergeableImportLines, ...mergeImportLines];
}
