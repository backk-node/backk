import log, { Severity } from './log';

export default function logEnvironment() {
  const filteredEnvironment = Object.entries(process.env).reduce(
    (accumulatedEnvironment, [envVariableName, envVariableValue]) => {
      const upperCaseEnvVariableName = envVariableName.toUpperCase();
      if (
        !upperCaseEnvVariableName.includes('SECRET') &&
        !upperCaseEnvVariableName.includes('KEY') &&
        !upperCaseEnvVariableName.includes('CRYPT') &&
        !upperCaseEnvVariableName.includes('CIPHER') &&
        !upperCaseEnvVariableName.includes('CODE') &&
        !upperCaseEnvVariableName.includes('PASSWORD') &&
        !upperCaseEnvVariableName.includes('PASSWD') &&
        !upperCaseEnvVariableName.includes('PWD') &&
        !upperCaseEnvVariableName.includes('PASSPHRASE')
      ) {
        return { ...accumulatedEnvironment, [envVariableName]: envVariableValue };
      }

      return accumulatedEnvironment;
    },
    {}
  );

  log(Severity.DEBUG, 'Environment', '', filteredEnvironment);
}
