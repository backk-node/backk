import { readFileSync, renameSync } from 'fs';
import { replaceInFile } from 'replace-in-file';

export default async function changePackageJsonNameProperty() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const packageJsonContents = readFileSync('package.json', { encoding: 'UTF-8' });
    const packageJsonObject = JSON.parse(packageJsonContents);
    const microserviceName = process.cwd().split('/').reverse()[0];
    packageJsonObject.name = microserviceName;
    const replaceConfig = {
      files: [
        'package.json',
        'env.dev',
        'env.ci',
        'package-lock.json',
        'sonar-project.properties',
        '.github/workflows/ci.yaml',
        'helm/backk-starter/Chart.yaml',
        'helm/backk-starter/values.yaml',
        'helm/values/values-minikube.yaml'
      ],
      from: /backk-starter/g,
      to: microserviceName
    }
    await replaceInFile(replaceConfig);
    renameSync('helm/backk-starter', 'helm/' + microserviceName);
  } catch {
    // No operation
  }
}
