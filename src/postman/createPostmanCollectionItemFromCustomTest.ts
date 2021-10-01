import _ from "lodash";
import throwException from "../utils/exception/throwException";
import { sign } from "jsonwebtoken";
import { Base64 } from "js-base64";

export default function createPostmanCollectionItemFromCustomTest({
  testTemplate: { authJwtSubject, authJwtRole, testTemplateName, serviceFunctionName, argument, responseStatusCode, responseTests }
}: any) {
  const checkResponseCode = responseStatusCode
    ? `pm.test("Status code is ${responseStatusCode} OK", function () {
  pm.response.to.have.status(${responseStatusCode});
});`
    : '';

  let auth;
  if (authJwtRole || authJwtSubject) {
    const payload = {};

    _.set(
      payload,
      'sub',
      authJwtSubject
    );

    _.set(
      payload,
      process.env.JWT_ROLES_CLAIM_PATH ??
      throwException('JWT_ROLES_CLAIM_PATH environment variable must be defined'),
      [authJwtRole ?? process.env.TEST_USER_ROLE]
    );

    const jwt = sign(payload, process.env.JWT_SIGN_SECRET || 'abcdef');

    auth = {
      type: 'bearer',
        bearer: [
        {
          key: 'token',
          value: Base64.encode(jwt),
          type: 'string'
        }
      ]
    }
  }

  return {
    name: testTemplateName,
    request: {
      method: 'POST',
      auth,
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
        raw: `http://localhost:${process.env.HTTP_SERVER_PORT ?? 3000}/${process.env.API_GATEWAY_PATH}/` + serviceFunctionName,
        protocol: 'http',
        host: ['localhost'],
        port: `${process.env.HTTP_SERVER_PORT ?? 3000}`,
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
