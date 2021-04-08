export default function createPostmanCollectionItemFromCustomTest({
  testTemplate: { testTemplateName, serviceFunctionName, argument, responseStatusCode, responseTests }
}: any) {
  const checkResponseCode = responseStatusCode
    ? `pm.test("Status code is ${responseStatusCode} OK", function () {
  pm.response.to.have.status(${responseStatusCode});
});`
    : '';

  return {
    name: testTemplateName,
    request: {
      method: 'POST',
      header:
        argument === undefined
          ? []
          : [
              {
                key: 'Content-Type',
                name: 'Content-Type',
                value: 'application/json',
                type: 'text'
              }
            ],
      body:
        argument === undefined
          ? undefined
          : {
              mode: 'raw',
              raw: JSON.stringify(argument, null, 4),
              options: {
                raw: {
                  language: 'json'
                }
              }
            },
      url: {
        raw: 'http://localhost:3000/' + serviceFunctionName,
        protocol: 'http',
        host: ['localhost'],
        port: '3000',
        path: [serviceFunctionName]
      }
    },
    response: [],
    event: [
      {
        id: serviceFunctionName,
        listen: 'test',
        script: {
          id: serviceFunctionName,
          exec: [
            checkResponseCode,
            responseTests ? 'const body = pm.response.json();' : '',
            ...(responseTests
              ? responseTests.map(
                  (test: string) =>
                    `pm.test("test", function () {
  ${test} 
})`
                )
              : [])
          ]
        }
      }
    ]
  };
}
