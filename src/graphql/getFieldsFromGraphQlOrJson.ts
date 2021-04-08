export default function getFieldsFromGraphQlOrJson(graphQlQueryOrJson: string) {
  if (graphQlQueryOrJson.includes(':') && !graphQlQueryOrJson.includes('\n')) {
    // noinspection AssignmentToFunctionParameterJS
    graphQlQueryOrJson = JSON.stringify(JSON.parse(graphQlQueryOrJson), null, 2);
  }
  const graphQlQueryLines = graphQlQueryOrJson.split('\n');
  const fields: string[] = [];
  let fieldPath = '';

  graphQlQueryLines
    .filter((graphQlQueryLine) => graphQlQueryLine.trim() !== '')
    .slice(1, -1)
    .forEach((graphQlQueryLine) => {
      if (graphQlQueryLine.endsWith('{')) {
        let fieldName = graphQlQueryLine.split('{')[0].trim();
        if (fieldName.endsWith(':')) {
          fieldName = fieldName.slice(1, -2);
        }
        fieldPath = fieldPath + fieldName + '.';
      } else if (graphQlQueryLine.endsWith('},') || graphQlQueryLine.endsWith('}')) {
        const secondLastDotPos = fieldPath.lastIndexOf('.', fieldPath.length - 2);
        fieldPath = fieldPath.slice(0, secondLastDotPos + 1);
      } else {
        let fieldName = graphQlQueryLine.trim();
        if (fieldName.includes(':')) {
          const fieldSpecParts = fieldName.split(/[:,]/);
          const fieldValue = fieldSpecParts[1].trim();
          // noinspection ReuseOfLocalVariableJS
          fieldName = fieldSpecParts[0].split('"')[1];
          if (fieldValue === 'true') {
            fields.push(fieldPath + fieldName);
          }
        } else {
          fields.push(fieldPath + fieldName);
        }
      }
    });

  return fields;
}
