import { readFileSync, writeFileSync } from 'fs';
import getServiceName from './getServiceName';

export default function changePackageJsonNameProperty() {
  try {
    const packageJsonContents = readFileSync('package.json', { encoding: 'UTF-8' });

    const packageJsonObject = JSON.parse(packageJsonContents);
    if (packageJsonObject.name === 'my-microservice') {
      packageJsonObject.name = getServiceName();
      writeFileSync('package.json', JSON.stringify(packageJsonObject, null, 2), { encoding: 'UTF-8' });
    }
  } catch {
    // No operation
  }
}
